"""Offline stdlib checks only: canned API data, checked-in wiring, mocked SSH/Docker.

No YAML/expression interpreter and no claim to exercise GitHub's native approvals.
"""

import copy
import contextlib
import io
import json
import os
from pathlib import Path
import re
import signal
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

import deployment_policy as gate

ROOT = Path(__file__).resolve().parents[2]
SHA = "a" * 40
RUN_PATH = "/actions/runs/101"
ATTEMPT_PATH = RUN_PATH + "/attempts/2"
JOBS_PATH = ATTEMPT_PATH + "/jobs?per_page=100&page=1"
RUNS_PATH = f"/actions/workflows/31/runs?event=push&branch=main&head_sha={SHA}&per_page=100&page=1"


def invocation():
    return {"GITHUB_SERVER_URL": "https://github.com", "GITHUB_API_URL": "https://api.github.com",
            "GITHUB_REPOSITORY": gate.REPOSITORY, "GITHUB_REPOSITORY_ID": "11",
            "GITHUB_REPOSITORY_OWNER_ID": "12", "GITHUB_REF": gate.REF,
            "GITHUB_EVENT_NAME": "workflow_dispatch", "GITHUB_SHA": SHA,
            "GITHUB_WORKFLOW_SHA": SHA, "GITHUB_RUN_ID": "202", "GITHUB_RUN_ATTEMPT": "1",
            "GITHUB_WORKFLOW_REF": gate.REPOSITORY + "/" + gate.DEPLOY_WORKFLOW + "@" + gate.REF,
            "GH_READ_TOKEN": "ordinary-fixture", "GH_POLICY_READ_TOKEN": "policy-fixture"}


def fixtures():
    repository = {"id": 11, "full_name": gate.REPOSITORY, "owner": {"id": 12, "login": "kira-manga"},
                  "fork": False, "archived": False, "disabled": False, "default_branch": "main"}
    environment = {"id": 21, "name": "production", "can_admins_bypass": False,
                   "deployment_branch_policy": {"protected_branches": False, "custom_branch_policies": True},
                   "protection_rules": [
                       {"type": "required_reviewers", "prevent_self_review": True, "id": 22,
                        "reviewers": [{"type": "User", "reviewer": {"type": "User", "id": 23, "login": "reviewer"}}]},
                       {"type": "branch_policy", "id": 24, "node_id": "native-marker"}]}
    protection = {"enforce_admins": {"enabled": True}, "allow_force_pushes": {"enabled": False},
                  "allow_deletions": {"enabled": False}, "required_pull_request_reviews": {
                      "required_approving_review_count": 2, "dismiss_stale_reviews": True,
                      "require_last_push_approval": True,
                      "bypass_pull_request_allowances": {"users": [], "teams": [], "apps": []}},
                  "required_status_checks": {"strict": True, "contexts": ["web-verify"],
                                             "checks": [{"context": "web-verify", "app_id": 15368}]}}
    run = {"id": 101, "run_attempt": 2, "workflow_id": 31, "path": gate.VERIFY_WORKFLOW,
           "event": "push", "head_branch": "main", "head_sha": SHA, "status": "completed",
           "conclusion": "success", "repository": copy.deepcopy(repository), "head_repository": copy.deepcopy(repository)}
    job = {"id": 102, "run_id": 101, "run_attempt": 2, "name": "web-verify", "head_branch": "main",
           "head_sha": SHA, "status": "completed", "conclusion": "success"}
    return {"": repository, "/environments/production": environment, gate.PROTECTION: protection,
            gate.BRANCH_POLICIES: {"total_count": 1, "branch_policies": [{"id": 25, "name": "main", "type": "branch"}]},
            "/git/ref/heads/main": {"ref": gate.REF, "object": {"type": "commit", "sha": SHA}},
            "/actions/workflows/verify.yml": {"id": 31, "path": gate.VERIFY_WORKFLOW, "state": "active"},
            RUNS_PATH: {"total_count": 1, "workflow_runs": [copy.deepcopy(run)]},
            RUN_PATH: copy.deepcopy(run), ATTEMPT_PATH: copy.deepcopy(run),
            JOBS_PATH: {"total_count": 1, "jobs": [job]}}


class FakeApi:
    def __init__(self, routes=None, sequence=None):
        self.routes = copy.deepcopy(fixtures() if routes is None else routes)
        self.sequence = copy.deepcopy(sequence or {})
        self.calls = []

    def get(self, path):
        self.calls.append(path)
        if self.sequence.get(path):
            result = self.sequence[path].pop(0)
        else:
            if path not in self.routes:
                raise gate.Refused("unavailable fixture endpoint")
            result = self.routes[path]
        if isinstance(result, Exception):
            raise result
        return copy.deepcopy(result)


def replace(routes, endpoint, fields, value):
    target = routes[endpoint]
    for field in fields[:-1]:
        target = target[field]
    target[fields[-1]] = value


def invoke(mode, environ, api):
    output = io.StringIO()
    with mock.patch.dict(os.environ, environ, clear=True), mock.patch.object(gate, "Api", return_value=api), \
            contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
        result = gate.main([mode])
    return result, output.getvalue()


class PolicyTests(unittest.TestCase):
    def fingerprint(self, routes):
        return gate.read_policy(FakeApi(routes), gate.context(invocation()))[1]

    def test_documented_optional_marker_is_not_approval(self):
        routes = fixtures()
        expected = self.fingerprint(routes)
        self.assertRegex(expected, r"^[0-9a-f]{64}$")
        rules = routes["/environments/production"]["protection_rules"]
        rules[1] = {"type": "branch_policy"}
        self.assertEqual(self.fingerprint(routes), expected)
        rules.reverse()
        self.assertEqual(self.fingerprint(routes), expected)
        del rules[0]
        self.assertEqual(self.fingerprint(routes), expected)
        routes["/environments/production"]["protection_rules"] = [{"type": "branch_policy"}]
        with self.assertRaises(gate.Refused):
            self.fingerprint(routes)

    def test_only_enforced_values_and_stable_ids_are_fingerprinted(self):
        routes = fixtures()
        expected = self.fingerprint(routes)
        env = routes["/environments/production"]
        env.update({"updated_at": "display-only", "html_url": "https://github.com/display"})
        user = env["protection_rules"][0]["reviewers"][0]["reviewer"]
        user.update({"avatar_url": "https://example.invalid/avatar", "login": "renamed-reviewer"})
        self.assertEqual(self.fingerprint(routes), expected)
        user["id"] += 1
        self.assertNotEqual(self.fingerprint(routes), expected)

    def test_missing_bypassable_and_unsupported_controls_refuse(self):
        env, prot, refs = "/environments/production", gate.PROTECTION, gate.BRANCH_POLICIES
        review = ("required_pull_request_reviews",)
        check = ("required_status_checks",)
        cases = [
            (env, ("can_admins_bypass",), True), (env, ("can_admins_bypass",), None),
            (env, ("id",), True), (env, ("deployment_branch_policy",), None),
            (env, ("deployment_branch_policy", "protected_branches"), True),
            (env, ("deployment_branch_policy", "custom_branch_policies"), 1),
            (env, ("protection_rules",), []), (env, ("protection_rules",), None),
            (env, ("protection_rules", 1), {"type": "wait_timer", "wait_timer": 5}),
            (env, ("protection_rules", 1), {"type": "required_reviewers"}),
            (env, ("protection_rules", 1), {"type": "branch_policy", "prevent_self_review": False}),
            (env, ("protection_rules", 0, "prevent_self_review"), False),
            (env, ("protection_rules", 0, "reviewers"), []),
            (env, ("protection_rules", 0, "reviewers", 0, "type"), "Team"),
            (env, ("protection_rules", 0, "reviewers", 0, "reviewer", "type"), "Bot"),
            (env, ("protection_rules", 0, "reviewers", 0, "reviewer", "login"), "app[bot]"),
            (env, ("protection_rules", 0, "reviewers", 0, "reviewer", "id"), True),
            (refs, ("total_count",), 2), (refs, ("total_count",), True),
            (refs, ("branch_policies", 0, "name"), "main*"),
            (refs, ("branch_policies", 0, "type"), "tag"),
            (prot, ("enforce_admins", "enabled"), False), (prot, ("enforce_admins", "enabled"), 1),
            (prot, ("allow_force_pushes", "enabled"), True), (prot, ("allow_deletions", "enabled"), True),
            (prot, review + ("required_approving_review_count",), 0),
            (prot, review + ("required_approving_review_count",), 7),
            (prot, review + ("required_approving_review_count",), True),
            (prot, review + ("dismiss_stale_reviews",), False),
            (prot, review + ("require_last_push_approval",), False),
            (prot, review + ("bypass_pull_request_allowances",), None),
            (prot, review + ("bypass_pull_request_allowances", "apps"), [{"id": 1}]),
            (prot, check + ("strict",), False), (prot, check + ("contexts",), ["spoofed"]),
            (prot, check + ("checks", 0, "app_id"), None),
            (prot, check + ("checks", 0, "app_id"), 1),
            (prot, check + ("checks", 0, "context"), "spoofed"),
        ]
        for endpoint, fields, value in cases:
            with self.subTest(endpoint=endpoint, fields=fields, value=value):
                routes = fixtures()
                replace(routes, endpoint, fields, value)
                with self.assertRaises(gate.Refused):
                    self.fingerprint(routes)
        for endpoint in (env, prot, refs):
            for value in (None, {}, {"message": "unreadable"}):
                with self.subTest(endpoint=endpoint, value=value), self.assertRaises(gate.Refused):
                    self.fingerprint({**fixtures(), endpoint: value})

    def test_extra_refs_reviewers_rules_and_checks_refuse(self):
        for case in ("ref", "duplicate-reviewer", "seven-reviewers", "duplicate-marker", "extra-check"):
            routes = fixtures()
            env = routes["/environments/production"]
            users = env["protection_rules"][0]["reviewers"]
            if case == "ref":
                routes[gate.BRANCH_POLICIES] = {"total_count": 2, "branch_policies": [
                    {"id": 25, "name": "main", "type": "branch"}, {"id": 26, "name": "v1", "type": "tag"}]}
            elif case == "duplicate-reviewer":
                users.append(copy.deepcopy(users[0]))
            elif case == "seven-reviewers":
                env["protection_rules"][0]["reviewers"] = [
                    {"type": "User", "reviewer": {"id": i + 1, "login": f"user-{i}", "type": "User"}} for i in range(7)]
            elif case == "duplicate-marker":
                env["protection_rules"].append({"type": "branch_policy"})
            else:
                routes[gate.PROTECTION]["required_status_checks"]["checks"].append({"context": "other", "app_id": 15368})
            with self.subTest(case=case), self.assertRaises(gate.Refused):
                self.fingerprint(routes)

    def test_complete_listing_cap_rejects_truncation_and_excess(self):
        for response in ({"total_count": 1, "items": []}, {"total_count": True, "items": [{}]},
                         {"total_count": 101, "items": [{}] * 101}, {"total_count": 1, "items": [None]}):
            with self.subTest(response=str(response)[:60]), self.assertRaises(gate.Refused):
                gate.complete_list(response, "items")


class SourceTests(unittest.TestCase):
    def setUp(self):
        self.ctx = gate.context(invocation())

    def test_exact_successful_push_run_attempt_and_real_job_are_pinned(self):
        before = gate.snapshot(FakeApi(), self.ctx)
        self.assertEqual(before["verification"], {"workflow_id": 31, "workflow_path": gate.VERIFY_WORKFLOW,
                                                "run_id": 101, "run_attempt": 2, "sha": SHA, "job_id": 102})
        frozen = gate.parse_snapshot(gate.canonical(before), self.ctx)
        for _phase in ("after-approval", "after-build"):
            api = FakeApi()
            self.assertEqual(gate.snapshot(api, self.ctx, frozen), before)
            self.assertNotIn(RUNS_PATH, api.calls)  # No new selection after approval.
            self.assertEqual(api.calls.count(RUN_PATH), 2)
            self.assertIn(ATTEMPT_PATH, api.calls)
            self.assertIn(JOBS_PATH, api.calls)

    def test_spoofed_wrong_missing_and_unsuccessful_verification_refuses(self):
        cases = [("/actions/workflows/verify.yml", ("path",), ".github/workflows/spoof.yml"),
                 ("/actions/workflows/verify.yml", ("state",), "disabled_manually"),
                 (RUNS_PATH, ("total_count",), 2), (RUNS_PATH, ("workflow_runs",), []),
                 (JOBS_PATH, ("total_count",), 2), (JOBS_PATH, ("jobs",), [])]
        run_changes = [("path", gate.DEPLOY_WORKFLOW), ("workflow_id", 99), ("event", "pull_request"),
                       ("head_branch", "feature"), ("head_sha", "b" * 40), ("status", "in_progress"),
                       ("conclusion", "failure"), ("conclusion", "skipped"), ("conclusion", "neutral"),
                       ("run_attempt", 3), ("id", 999)]
        for endpoint in (RUN_PATH, ATTEMPT_PATH):
            cases += [(endpoint, (field,), value) for field, value in run_changes]
            cases += [(endpoint, (repo, field), value) for repo in ("repository", "head_repository")
                      for field, value in (("id", 999), ("full_name", "fork/kira-web"))]
        for field, value in [("name", "spoofed"), ("run_id", 999), ("run_attempt", 3), ("head_branch", "feature"),
                             ("head_sha", "b" * 40), ("status", "queued"), ("id", True)]:
            cases.append((JOBS_PATH, ("jobs", 0, field), value))
        for result in ("failure", "skipped", "neutral", "cancelled", "timed_out", None):
            cases.append((JOBS_PATH, ("jobs", 0, "conclusion"), result))
        for endpoint, fields, value in cases:
            with self.subTest(endpoint=endpoint, fields=fields, value=value):
                routes = fixtures()
                replace(routes, endpoint, fields, value)
                with self.assertRaises(gate.Refused):
                    gate.snapshot(FakeApi(routes), self.ctx)
        for endpoint, key in ((RUNS_PATH, "workflow_runs"), (JOBS_PATH, "jobs")):
            routes = fixtures()
            routes[endpoint][key].append(copy.deepcopy(routes[endpoint][key][0]))
            routes[endpoint]["total_count"] = 2
            with self.subTest(ambiguous=key), self.assertRaises(gate.Refused):
                gate.snapshot(FakeApi(routes), self.ctx)

    def test_rechecks_refuse_changed_valid_policy_identity_and_stale_main(self):
        frozen = gate.snapshot(FakeApi(), self.ctx)
        changes = [
            ("/git/ref/heads/main", ("object", "sha"), "b" * 40),
            ("/environments/production", ("id",), 99),
            ("/environments/production", ("protection_rules", 0, "reviewers", 0, "reviewer", "id"), 99),
            (gate.BRANCH_POLICIES, ("branch_policies", 0, "id"), 99),
            (gate.PROTECTION, ("required_pull_request_reviews", "required_approving_review_count"), 3),
            ("/actions/workflows/verify.yml", ("id",), 99),
            (JOBS_PATH, ("jobs", 0, "id"), 999), (RUN_PATH, ("run_attempt",), 3),
            ("", ("id",), 99), ("", ("owner", "id"), 99), ("", ("fork",), True),
        ]
        for endpoint, fields, value in changes:
            with self.subTest(endpoint=endpoint, fields=fields):
                routes = fixtures()
                replace(routes, endpoint, fields, value)
                api = FakeApi(routes)
                with self.assertRaises(gate.Refused):
                    gate.snapshot(api, self.ctx, frozen)
                self.assertNotIn(RUNS_PATH, api.calls)
        for endpoint in (RUN_PATH, ATTEMPT_PATH, JOBS_PATH, gate.PROTECTION):
            with self.subTest(unavailable=endpoint), self.assertRaises(gate.Refused):
                gate.snapshot(FakeApi({**fixtures(), endpoint: gate.Refused("unavailable")}), self.ctx, frozen)

    def test_rerun_started_during_job_read_is_rejected(self):
        routes = fixtures()
        newer = {**routes[RUN_PATH], "run_attempt": 3}
        with self.assertRaises(gate.Refused):
            gate.snapshot(FakeApi(routes, {RUN_PATH: [routes[RUN_PATH], newer]}), self.ctx)

    def test_snapshot_schema_and_invocation_cannot_be_rebound(self):
        frozen = gate.snapshot(FakeApi(), self.ctx)
        for raw in (None, "", "{}", "null", "[]", "x" * 8193, '{"version":1,"version":1}'):
            with self.subTest(raw=str(raw)[:40]), self.assertRaises(gate.Refused):
                gate.parse_snapshot(raw, self.ctx)
        for fields, value in [(("version",), True), (("deployment", "run_id"), 999),
                              (("policy_sha256",), "bad"), (("verification", "job_id"), True),
                              (("verification", "workflow_path"), gate.DEPLOY_WORKFLOW)]:
            changed = copy.deepcopy(frozen)
            replace({"snapshot": changed}, "snapshot", fields, value)
            with self.subTest(fields=fields), self.assertRaises(gate.Refused):
                gate.parse_snapshot(gate.canonical(changed), self.ctx)

    def test_cli_never_overwrites_preapproval_output(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "outputs"
            env = {**invocation(), "GITHUB_OUTPUT": str(output)}
            self.assertEqual(invoke("preflight", env, FakeApi())[0], 0)
            initial = output.read_text()
            self.assertEqual(len(initial.splitlines()), 1)
            env["WEB_DEPLOYMENT_SNAPSHOT"] = initial.removeprefix("snapshot=").strip()
            self.assertEqual(invoke("recheck", env, FakeApi())[0], 0)
            changed = fixtures()
            changed["/git/ref/heads/main"]["object"]["sha"] = "b" * 40
            self.assertEqual(invoke("recheck", env, FakeApi(changed))[0], 1)
            self.assertEqual(output.read_text(), initial)
            self.assertNotIn("fixture", initial)

    def test_untrusted_context_stops_before_api_or_output(self):
        changes = {"GITHUB_REPOSITORY": "fork/kira-web", "GITHUB_REF": "refs/tags/main",
                   "GITHUB_EVENT_NAME": "push", "GITHUB_WORKFLOW_REF": "wrong/workflow@refs/heads/main",
                   "GITHUB_WORKFLOW_SHA": "b" * 40, "GITHUB_SHA": "A" * 40, "GITHUB_RUN_ATTEMPT": "2",
                   "GITHUB_API_URL": "https://evil.invalid", "GITHUB_REPOSITORY_ID": "0"}
        for key, value in changes.items():
            with self.subTest(key=key), mock.patch.dict(os.environ, {**invocation(), key: value}, clear=True), \
                    mock.patch.object(gate, "Api") as api, contextlib.redirect_stderr(io.StringIO()):
                self.assertEqual(gate.main(["preflight"]), 1)
                api.assert_not_called()

    def test_missing_snapshot_stops_before_api_and_raw_errors_are_not_logged(self):
        with mock.patch.dict(os.environ, invocation(), clear=True), mock.patch.object(gate, "Api") as api, \
                contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(gate.main(["recheck"]), 1)
            api.assert_not_called()
        env = {**invocation(), "GITHUB_OUTPUT": "unused-output-channel"}
        failed = FakeApi({**fixtures(), gate.PROTECTION: RuntimeError("never-log-policy-fixture")})
        result, output = invoke("preflight", env, failed)
        self.assertEqual(result, 1)
        self.assertNotIn("fixture", output)

    def test_drift_reuses_policy_without_ci_build_or_deployment(self):
        env = {**invocation(), "GITHUB_EVENT_NAME": "schedule",
               "GITHUB_WORKFLOW_REF": gate.REPOSITORY + "/" + gate.DRIFT_WORKFLOW + "@" + gate.REF}
        api = FakeApi()
        self.assertEqual(invoke("drift", env, api)[0], 0)
        self.assertIn(gate.PROTECTION, api.calls)
        self.assertFalse(any("actions/" in path for path in api.calls))
        routes = fixtures()
        routes[gate.PROTECTION]["enforce_admins"]["enabled"] = False
        self.assertEqual(invoke("drift", env, FakeApi(routes))[0], 1)


class ApiTests(unittest.TestCase):
    def request(self, path="/environments/production", raw=b"{}", status=200, headers=None, failure=None):
        response = mock.Mock(status=status)
        values = {"Content-Type": "application/json; charset=utf-8", **(headers or {})}
        response.getheader.side_effect = lambda key, default=None: values.get(key, default)
        response.read.side_effect = lambda limit: raw[:limit]
        connection = mock.Mock()
        connection.getresponse.return_value = response
        connection.request.side_effect = failure
        with mock.patch.object(gate.http.client, "HTTPSConnection", return_value=connection) as constructor:
            try:
                result = gate.Api("ordinary-fixture", "policy-fixture").get(path)
            finally:
                # Including redirect/error responses: no second host/request or auth forwarding.
                constructor.assert_called_once()
                connection.request.assert_called_once()
                connection.close.assert_called_once()
        return result, constructor, connection, response

    def test_fixed_https_version_bounded_read_and_endpoint_token_separation(self):
        for path, token in ((gate.PROTECTION, "policy-fixture"), ("/environments/production", "ordinary-fixture")):
            result, constructor, connection, response = self.request(path)
            self.assertEqual(result, {})
            self.assertEqual(constructor.call_args.args, ("api.github.com",))
            self.assertLessEqual(constructor.call_args.kwargs["timeout"], 8)
            args = connection.request.call_args
            self.assertEqual(args.args, ("GET", "/repos/" + gate.REPOSITORY + path))
            self.assertEqual(args.kwargs["headers"]["Authorization"], "Bearer " + token)
            self.assertEqual(args.kwargs["headers"]["X-GitHub-Api-Version"], "2022-11-28")
            self.assertEqual(args.kwargs["headers"]["Accept-Encoding"], "identity")
            response.read.assert_called_once_with(gate.MAX_BODY + 1)
            connection.close.assert_called_once()

    def test_transport_and_malformed_or_incomplete_replies_fail_closed(self):
        cases = [{"status": status, "headers": {"Location": "https://evil.invalid/"}} for status in (301, 302, 401, 403, 404, 429, 500)]
        cases += [{"headers": headers} for headers in (
            {"Content-Type": "text/html"}, {"Content-Encoding": "gzip"},
            {"Link": '<https://evil.invalid/>; rel="next"'},
            {"Content-Length": str(gate.MAX_BODY + 1)}, {"Content-Length": "invalid"})]
        cases += [{"raw": raw} for raw in (b"null", b"[]", b"bad", b"\xff", b'{"a":1,"a":2}', b'{"a":NaN}', b"x" * (gate.MAX_BODY + 1))]
        cases += [{"failure": TimeoutError("do-not-log-policy-fixture")}]
        for case in cases:
            with self.subTest(case={k: str(v)[:50] for k, v in case.items()}), self.assertRaises(gate.Refused) as failure:
                self.request(**case)
            self.assertNotIn("fixture", str(failure.exception))

    def test_missing_authority_unknown_paths_and_budgets_deny_before_connect(self):
        for tokens in ((None, "policy"), ("ordinary", None), ("", "policy"), ("ordinary", "token\nvalue")):
            with self.subTest(tokens=tokens), self.assertRaises(gate.Refused):
                gate.Api(*tokens)
        for path in ("https://evil.invalid/", "//evil.invalid", "/../secrets", "/branches/main/protection?other=1"):
            with self.subTest(path=path), mock.patch.object(gate.http.client, "HTTPSConnection") as constructor:
                with self.assertRaises(gate.Refused):
                    gate.Api("read", "policy").get(path)
                constructor.assert_not_called()
        for field, value in (("deadline", 0), ("requests", 20)):
            api = gate.Api("read", "policy")
            setattr(api, field, value)
            with mock.patch.object(gate.http.client, "HTTPSConnection") as constructor, self.assertRaises(gate.Refused):
                api.get("")
            constructor.assert_not_called()

    def test_absolute_request_deadline_is_armed_and_restored(self):
        # Invoke the installed deadline handler rather than sleeping or opening a socket.
        with mock.patch.object(gate.signal, "signal", return_value=signal.SIG_DFL) as handler, \
                mock.patch.object(gate.signal, "setitimer") as timer:
            def drip(*_args, **_kwargs):
                handler.call_args_list[0].args[1](signal.SIGALRM, None)
            with self.assertRaisesRegex(gate.Refused, "deadline"):
                self.request(failure=drip)
            self.assertGreater(timer.call_args_list[0].args[1], 0)
            self.assertLessEqual(timer.call_args_list[0].args[1], 10)
            self.assertEqual(timer.call_args_list[-1].args, (signal.ITIMER_REAL, 0))
            self.assertEqual(handler.call_args_list[-1].args, (signal.SIGALRM, signal.SIG_DFL))


class WorkflowTests(unittest.TestCase):
    @staticmethod
    def steps(block):
        # Only the checked-in, fixed indentation/step boundary; not a YAML parser.
        return re.split(r"(?m)^      - ", block.split("    steps:\n", 1)[1])[1:]

    def assert_deploy_wiring(self, text):
        prefix, jobs = text.split("jobs:\n", 1)
        self.assertIn("on:\n  workflow_dispatch:\n", prefix)
        self.assertNotRegex(prefix, r"push:|pull_request|inputs:")
        self.assertIn("group: kira-web-production\n  cancel-in-progress: false", prefix)
        self.assertEqual(re.findall(r"(?m)^  ([a-z-]+):$", jobs), ["preflight", "deploy"])
        preflight, deploy = jobs.split("  deploy:\n", 1)
        self.assertIn("    needs: preflight\n", deploy)
        self.assertIn("    environment: production\n", deploy)
        self.assertNotIn("environment:", preflight)
        guard = ("github.repository == 'kira-manga/kira-web' && github.event_name == 'workflow_dispatch' && "
                 "github.ref == 'refs/heads/main' && github.workflow_ref == "
                 "'kira-manga/kira-web/.github/workflows/deploy.yml@refs/heads/main' && "
                 "github.workflow_sha == github.sha && github.run_attempt == 1")
        for block, extra in ((preflight, ""), (deploy, "needs.preflight.result == 'success' && ")):
            actual = block.split("    if: >-\n", 1)[1].split("    runs-on:", 1)[0]
            self.assertEqual(" ".join(actual.split()), "${{ " + extra + guard + " }}")
            self.assertNotRegex(block, r"always\(|continue-on-error|GITHUB_ENV|SERVER3_SSH_PRIVATE_KEY|SERVER3_KNOWN_HOSTS")
            self.assertIn("ref: ${{ github.sha }}\n          persist-credentials: false", block)
        before, after = self.steps(preflight), self.steps(deploy)
        self.assertEqual(len(before), 2)
        self.assertEqual(len(after), 9)
        self.assertIn("snapshot: ${{ steps.policy.outputs.snapshot }}", preflight)
        self.assertIn("id: policy", before[1])
        self.assertIn("run: python3 scripts/ci/deployment_policy.py preflight", before[1])
        self.assertIn("uses: actions/setup-node@", after[2])
        self.assertIn("node-version: '22'", after[2])
        self.assertIn("uses: docker/setup-buildx-action@", after[3])
        self.assertIn("uses: docker/build-push-action@", after[4])
        for required in ("load: true", "push: false", "tags: kira-web:${{ github.sha }}", "KIRA_WEB_PRODUCTION=true",
                         "KIRA_WEB_SOURCE_REVISION=${{ github.sha }}",
                         "ANDROID_APP_SHA256_CERT_FINGERPRINT=${{ vars.ANDROID_APP_SHA256_CERT_FINGERPRINT }}",
                         "NEXT_PUBLIC_KIRA_API_URL=https://api.kiramanga.me"):
            self.assertIn(required, after[4])
        for index in (1, 5):
            self.assertIn("WEB_DEPLOYMENT_SNAPSHOT: ${{ needs.preflight.outputs.snapshot }}", after[index])
            self.assertIn("run: python3 scripts/ci/deployment_policy.py recheck", after[index])
        self.assertIn("REVISION: ${{ github.sha }}", after[6])
        self.assertIn("secrets.WEB_PRODUCTION_SSH_PRIVATE_KEY", after[6])
        self.assertIn("secrets.WEB_PRODUCTION_SSH_KNOWN_HOSTS", after[6])
        self.assertIn("run: bash scripts/ci/deploy-web.sh", after[6])
        self.assertIn("id: public_verification", after[7])
        self.assertIn("timeout-minutes: 2", after[7])
        self.assertIn("KIRA_WEB_SOURCE_REVISION: ${{ github.sha }}", after[7])
        self.assertIn("run: node scripts/verify-deployment.mjs\n", after[7])
        self.assertNotRegex(after[7], r"\|\||exit 0|npm |https?://|sleep |retry")
        for name in ("ANDROID_APP_SHA256_CERT_FINGERPRINT", "ANDROID_PACKAGE_NAME", "APPLE_TEAM_ID", "IOS_BUNDLE_ID"):
            self.assertIn(name + "=${{ vars." + name + " }}", after[4])
            self.assertIn(name + ": ${{ vars." + name + " }}", after[7])
        self.assertIn("if: ${{ failure() && steps.public_verification.outcome == 'failure' }}", after[8])
        for notice in ("::error::Public release verification failed", "Activation may remain active",
                       "No rollback was attempted", "GITHUB_STEP_SUMMARY", "incident hold",
                       "EXTERNAL VERIFICATION REQUIRED"):
            self.assertIn(notice, after[8])
        for step in after[7:]:
            self.assertNotRegex(step, r"secrets\.|github.token|SSH_|\bssh\b|\bdocker\b|kira-deploy|: write")
        for step in before + after:
            self.assertNotIn("continue-on-error", step)
            if step != after[8]:
                self.assertNotRegex(step, r"\bif:")  # Only the final failure notice may bypass success ordering.
            if "deployment_policy.py" in step:
                self.assertIn("GH_READ_TOKEN: ${{ github.token }}", step)
                self.assertIn("GH_POLICY_READ_TOKEN: ${{ secrets.WEB_PRODUCTION_POLICY_READ_TOKEN }}", step)
                self.assertNotIn("SSH_", step)
            else:
                self.assertNotRegex(step, r"GH_READ_TOKEN|GH_POLICY_READ_TOKEN|POLICY_READ_TOKEN")
            if step != after[6]:
                self.assertNotIn("secrets.WEB_PRODUCTION_SSH", step)

    def test_actual_workflow_failure_dependencies_and_credential_ordering(self):
        self.assert_deploy_wiring((ROOT / ".github/workflows/deploy.yml").read_text())

    def test_failure_notice_writes_hold_without_recovery_authority(self):
        deploy = (ROOT / ".github/workflows/deploy.yml").read_text().split("  deploy:\n", 1)[1]
        notice = self.steps(deploy)[8].split("        run: |\n", 1)[1]
        script = "\n".join(line[10:] for line in notice.splitlines())
        with tempfile.TemporaryDirectory(prefix="web-public-notice-") as directory:
            summary = Path(directory) / "summary.md"
            env = {"PATH": os.defpath, "GITHUB_STEP_SUMMARY": str(summary)}
            result = subprocess.run(["bash", "-euo", "pipefail", "-c", script], env=env,
                                    capture_output=True, text=True, timeout=3)
            self.assertEqual(result.returncode, 0)
            self.assertIn("::error::Public release verification failed", result.stdout)
            self.assertIn("This deployment remains failed", summary.read_text())
            self.assertIn("known-public-good immutable image/archive/source revision tuple", summary.read_text())
            # A summary write failure is not converted into a successful gate/recovery either.
            env["GITHUB_STEP_SUMMARY"] = directory
            failed = subprocess.run(["bash", "-euo", "pipefail", "-c", script], env=env,
                                    capture_output=True, text=True, timeout=3)
            self.assertNotEqual(failed.returncode, 0)
            self.assertIn("::error::Public release verification failed", failed.stdout)

    def test_wiring_checks_detect_dependency_bypass_or_refreshed_baseline(self):
        source = (ROOT / ".github/workflows/deploy.yml").read_text()
        for old, new in (("needs: preflight", "needs: []"), ("environment: production", "environment: staging"),
                         ("needs.preflight.result == 'success'", "always()"),
                         ("deployment_policy.py recheck", "deployment_policy.py preflight"),
                         ("secrets.WEB_PRODUCTION_SSH_PRIVATE_KEY", "secrets.SERVER3_SSH_PRIVATE_KEY"),
                         ("KIRA_WEB_SOURCE_REVISION=${{ github.sha }}", "KIRA_WEB_SOURCE_REVISION=main"),
                         ("KIRA_WEB_SOURCE_REVISION: ${{ github.sha }}", "KIRA_WEB_SOURCE_REVISION: main"),
                         ("run: node scripts/verify-deployment.mjs", "if: false\n        run: node scripts/verify-deployment.mjs"),
                         ("run: node scripts/verify-deployment.mjs", "run: node scripts/verify-deployment.mjs || true"),
                         ("steps.public_verification.outcome == 'failure'", "steps.public_verification.outcome == 'success'")):
            with self.subTest(old=old), self.assertRaises(AssertionError):
                self.assert_deploy_wiring(source.replace(old, new))

    def test_source_checks_and_drift_are_read_only_and_pinned(self):
        verify = (ROOT / ".github/workflows/verify.yml").read_text()
        self.assertIn("pull_request:\n    branches: [main]", verify)
        self.assertIn("push:\n    branches: [main]", verify)
        self.assertIn("  web-verify:\n    name: web-verify\n", verify)
        self.assertNotRegex(verify, r"environment:|secrets\.|pull_request_target|paths:|continue-on-error|\bif:")
        for command in ("python3 -m unittest discover -s scripts/ci -p 'test_*.py'", "node scripts/test-verify-deployment.mjs", "npm ci", "npm run verify"):
            self.assertIn("run: " + command, verify)
        self.assertIn("KIRA_WEB_SOURCE_REVISION: ${{ github.sha }}", verify)
        drift = (ROOT / ".github/workflows/production-policy.yml").read_text()
        self.assertIn("github.repository == 'kira-manga/kira-web'", drift)
        self.assertIn("github.ref == 'refs/heads/main'", drift)
        self.assertIn(gate.REPOSITORY + "/" + gate.DRIFT_WORKFLOW + "@" + gate.REF, drift)
        self.assertIn("github.workflow_sha == github.sha && github.run_attempt == 1", drift)
        self.assertIn("run: python3 scripts/ci/deployment_policy.py drift", drift)
        self.assertNotRegex(drift, r"environment:|SSH_|npm |docker|: write")
        for path in (ROOT / ".github/workflows").glob("*.yml"):
            text = path.read_text()
            self.assertNotIn(": write", text)
            for action in re.findall(r"uses:\s+(\S+)", text):
                self.assertRegex(action, r"^[A-Za-z0-9_/-]+@[0-9a-f]{40}$")


# All executable external pipeline commands below are stand-ins, including timeout.
MOCK_COMMAND = r'''
import json, os, pathlib, stat, sys
name = pathlib.Path(sys.argv[0]).name
args = sys.argv[1:]
record = {"name": name, "args": args, "secret_env_clear": all(
    key not in os.environ for key in ("DEPLOY_KEY", "PINNED_KNOWN_HOSTS", "SSH_AUTH_SOCK"))}
if name == "ssh":
    key = pathlib.Path(args[args.index("-i") + 1])
    hosts = pathlib.Path(next(arg.split("=", 1)[1] for arg in args if arg.startswith("UserKnownHostsFile=")))
    record.update({"key_mode": stat.S_IMODE(key.stat().st_mode), "hosts_mode": stat.S_IMODE(hosts.stat().st_mode),
                   "directory_mode": stat.S_IMODE(key.parent.stat().st_mode),
                   "key_ok": key.read_text() == "fake-private-key\n", "hosts_ok": hosts.read_text() == "pinned-host-fixture\n",
                   "payload_ok": sys.stdin.buffer.read() == b"fixture-image"})
elif name == "gzip":
    payload = sys.stdin.buffer.read()
with open(os.environ["MOCK_LOG"], "a") as output:
    output.write(json.dumps(record) + "\n")
if name == os.environ.get("MOCK_FAIL"):
    sys.exit(124 if name == "timeout" else 41)
if name == "docker":
    sys.stdout.buffer.write(b"fixture-image")
elif name == "gzip":
    sys.stdout.buffer.write(payload)
elif name == "timeout":
    os.execvp(args[3], args[3:])
'''


class ShellTests(unittest.TestCase):
    def transfer(self, overrides=None, failure=""):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            runner, binaries = base / "runner", base / "bin"
            runner.mkdir()
            binaries.mkdir()
            sentinel = runner / "unrelated-key"
            sentinel.write_text("do not remove")
            for command in ("docker", "gzip", "ssh", "timeout"):
                executable = binaries / command
                executable.write_text("#!" + sys.executable + "\n" + MOCK_COMMAND)
                executable.chmod(0o700)
            env = {"PATH": str(binaries) + ":/usr/bin:/bin", "HOME": directory, "RUNNER_TEMP": str(runner),
                   "REVISION": SHA, "DEPLOY_HOST": "server3.example.invalid", "DEPLOY_USER": "deploy", "DEPLOY_PORT": "22",
                   "DEPLOY_KEY": "fake-private-key", "PINNED_KNOWN_HOSTS": "pinned-host-fixture",
                   "SSH_AUTH_SOCK": "/unrelated-agent", "MOCK_LOG": str(base / "log"), "MOCK_FAIL": failure,
                   **(overrides or {})}
            process = subprocess.run(["bash", str(ROOT / "scripts/ci/deploy-web.sh")], env=env,
                                     capture_output=True, text=True, timeout=5, cwd=ROOT)
            records = [json.loads(line) for line in (base / "log").read_text().splitlines()] if (base / "log").exists() else []
            self.assertEqual(sentinel.read_text(), "do not remove")
            self.assertEqual(list(runner.glob("kira-web-ssh.*")), [])
            self.assertFalse((base / ".ssh").exists())
            self.assertNotIn("fake-private-key", process.stdout + process.stderr)
            self.assertNotIn("pinned-host-fixture", process.stdout + process.stderr)
            return process, records

    def test_shell_syntax_and_owned_cleanup_traps(self):
        path = ROOT / "scripts/ci/deploy-web.sh"
        result = subprocess.run(["bash", "-n", str(path)], capture_output=True, text=True, timeout=5)
        self.assertEqual(result.returncode, 0, result.stderr)
        text = path.read_text()
        self.assertIn("trap cleanup EXIT", text)
        self.assertIn("trap 'exit 130' INT", text)
        self.assertIn("trap 'exit 143' TERM", text)
        self.assertNotRegex(text, r"ssh-keyscan|~/.ssh|eval ")

    def test_same_sha_fixed_gateway_pinned_host_and_scoped_secret_files(self):
        process, records = self.transfer({"DEPLOY_PORT": ""})
        self.assertEqual(process.returncode, 0, process.stderr)
        by_name = {record["name"]: record for record in records}
        self.assertEqual(set(by_name), {"timeout", "docker", "gzip", "ssh"})
        self.assertTrue(all(record["secret_env_clear"] for record in records))
        self.assertEqual(by_name["timeout"]["args"][:3], ["--signal=TERM", "--kill-after=10s", "5m"])
        self.assertEqual(by_name["docker"]["args"], ["save", "kira-web:" + SHA])
        self.assertEqual(by_name["gzip"]["args"], ["-9"])
        ssh = by_name["ssh"]
        self.assertEqual(ssh["args"][-2:], ["deploy@server3.example.invalid", "deploy web " + SHA])
        self.assertEqual(ssh["args"][:2], ["-F", "/dev/null"])
        self.assertEqual(ssh["args"][ssh["args"].index("-p") + 1], "22")
        for option in ("StrictHostKeyChecking=yes", "GlobalKnownHostsFile=/dev/null", "UpdateHostKeys=no",
                       "IdentityAgent=none", "BatchMode=yes", "IdentitiesOnly=yes", "PasswordAuthentication=no",
                       "KbdInteractiveAuthentication=no", "ConnectTimeout=15", "ConnectionAttempts=1"):
            self.assertIn(option, ssh["args"])
        self.assertEqual((ssh["key_mode"], ssh["hosts_mode"], ssh["directory_mode"]), (0o600, 0o600, 0o700))
        self.assertTrue(ssh["key_ok"] and ssh["hosts_ok"] and ssh["payload_ok"])

    def test_invalid_data_never_materializes_keys_or_calls_transfer_commands(self):
        cases = {"REVISION": ["a" * 39, "A" * 40, SHA + ";id"],
                 "DEPLOY_HOST": ["-oProxyCommand=bad", "user@host", "bad host", "::1", ""],
                 "DEPLOY_USER": ["-option", "user;id", ""], "DEPLOY_PORT": ["0", "01", "65536", "22;id"],
                 "DEPLOY_KEY": [""], "PINNED_KNOWN_HOSTS": [""]}
        for key, values in cases.items():
            for value in values:
                with self.subTest(key=key, value=value):
                    process, records = self.transfer({key: value})
                    self.assertNotEqual(process.returncode, 0)
                    self.assertEqual(records, [])

    def test_pipeline_and_timeout_failures_cleanup_only_owned_material(self):
        for command in ("docker", "gzip", "ssh", "timeout"):
            with self.subTest(command=command):
                process, records = self.transfer(failure=command)
                self.assertNotEqual(process.returncode, 0)
                self.assertIn("image transfer failed", process.stderr)
                self.assertIn(command, [record["name"] for record in records])


if __name__ == "__main__":
    unittest.main()
