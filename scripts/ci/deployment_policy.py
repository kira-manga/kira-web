#!/usr/bin/env python3
"""Fail-closed github.com production gate; Python standard library, no policy writes.

Native environment approval authorizes deployment. These snapshots only check the
supported installed controls and pin source/verification evidence around that wait.
"""

import hashlib
import http.client
import json
import os
import re
import signal
import ssl
import sys
import time

REPOSITORY = "kira-manga/kira-web"
REF = "refs/heads/main"
DEPLOY_WORKFLOW = ".github/workflows/deploy.yml"
VERIFY_WORKFLOW = ".github/workflows/verify.yml"
DRIFT_WORKFLOW = ".github/workflows/production-policy.yml"
PROTECTION = "/branches/main/protection"
BRANCH_POLICIES = "/environments/production/deployment-branch-policies?per_page=100&page=1"
GITHUB_ACTIONS_APP_ID = 15368
MAX_BODY = 2 * 1024 * 1024
MAX_LIST = 100
RUN_KEYS = {"workflow_id", "workflow_path", "run_id", "run_attempt", "sha"}


class Refused(Exception):
    """Only static, non-sensitive explanations may be emitted to Actions logs."""


def need(condition, message):
    if not condition:
        raise Refused(message)


def obj(value):
    need(type(value) is dict, "missing or malformed metadata object")
    return value


def integer(value):
    need(type(value) is int and 0 < value < 2**63, "invalid metadata identity")
    return value


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        need(key not in result, "duplicate JSON key")
        result[key] = value
    return result


def invalid_constant(_value):
    raise Refused("non-finite JSON value")


def decode_object(raw):
    try:
        return obj(json.loads(raw, object_pairs_hook=unique_object, parse_constant=invalid_constant))
    except (ValueError, UnicodeError, RecursionError):
        raise Refused("malformed JSON metadata") from None


def complete_list(response, key):
    response = obj(response)
    values = response.get(key)
    count = response.get("total_count")
    need(type(values) is list and type(count) is int and count == len(values)
         and 0 <= count <= MAX_LIST, "incomplete or oversized metadata listing")
    for value in values:
        obj(value)
    return values


class Api:
    """Fixed host/GET paths, no redirects/proxies, endpoint-confined special token.

    Linux/main-thread CLI: SIGALRM bounds header/body drips as well as idle socket
    timeouts. Each request has 10 seconds; the entire client has 60 seconds/20 GETs.
    """

    def __init__(self, read_token, policy_token):
        for token in (read_token, policy_token):
            need(type(token) is str and 0 < len(token) <= 4096
                 and all(33 <= ord(char) <= 126 for char in token), "missing read authority")
        self.read_token = read_token
        self.policy_token = policy_token
        self.deadline = time.monotonic() + 60
        self.requests = 0

    def get(self, path):
        static = {"", "/git/ref/heads/main", "/environments/production", BRANCH_POLICIES,
                  "/actions/workflows/verify.yml", PROTECTION}
        dynamic = (r"/actions/workflows/[1-9][0-9]*/runs\?event=push&branch=main&"
                   r"head_sha=[0-9a-f]{40}&per_page=100&page=1|"
                   r"/actions/runs/[1-9][0-9]*(?:/attempts/[1-9][0-9]*"
                   r"(?:/jobs\?per_page=100&page=1)?)?")
        need(type(path) is str and (path in static or re.fullmatch(dynamic, path)),
             "unsupported metadata endpoint")
        remaining = self.deadline - time.monotonic()
        self.requests += 1
        need(remaining > 0 and self.requests <= 20, "metadata request budget exhausted")

        def expired(_signum, _frame):
            raise Refused("metadata deadline exceeded")

        previous = signal.signal(signal.SIGALRM, expired)
        signal.setitimer(signal.ITIMER_REAL, min(10, remaining))
        connection = None
        try:
            connection = http.client.HTTPSConnection(
                "api.github.com", timeout=min(8, remaining), context=ssl.create_default_context())
            token = self.policy_token if path == PROTECTION else self.read_token
            connection.request("GET", "/repos/" + REPOSITORY + path, headers={
                "Authorization": "Bearer " + token,
                "Accept": "application/vnd.github+json",
                "Accept-Encoding": "identity",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "kira-web-production-policy",
            })
            response = connection.getresponse()
            need(response.status == 200, "GitHub metadata unavailable (non-200 response)")
            need(response.getheader("Content-Type", "").split(";", 1)[0].lower()
                 in {"application/json", "application/vnd.github+json"}, "non-JSON metadata response")
            need(response.getheader("Content-Encoding", "identity").lower() == "identity",
                 "encoded metadata response is unsupported")
            # All supported listings fit one requested page. Never follow pagination URLs.
            need(not response.getheader("Link"), "paginated metadata is unsupported")
            length = response.getheader("Content-Length")
            if length is not None:
                need(re.fullmatch(r"[0-9]{1,10}", length) and int(length) <= MAX_BODY,
                     "oversized metadata response")
            raw = response.read(MAX_BODY + 1)
            need(len(raw) <= MAX_BODY, "oversized metadata response")
            return decode_object(raw.decode("utf-8"))
        except (OSError, http.client.HTTPException, UnicodeError):
            raise Refused("GitHub metadata transport unavailable") from None
        finally:
            signal.setitimer(signal.ITIMER_REAL, 0)
            signal.signal(signal.SIGALRM, previous)
            if connection is not None:
                connection.close()


def context(environ, drift=False):
    workflow = DRIFT_WORKFLOW if drift else DEPLOY_WORKFLOW
    event = environ.get("GITHUB_EVENT_NAME")
    sha = environ.get("GITHUB_SHA", "")
    workflow_ref = REPOSITORY + "/" + workflow + "@" + REF
    need(environ.get("GITHUB_SERVER_URL") == "https://github.com"
         and environ.get("GITHUB_API_URL") == "https://api.github.com"
         and environ.get("GITHUB_REPOSITORY") == REPOSITORY
         and environ.get("GITHUB_REF") == REF
         and event in ({"schedule", "workflow_dispatch"} if drift else {"workflow_dispatch"})
         and environ.get("GITHUB_WORKFLOW_REF") == workflow_ref
         and re.fullmatch(r"[0-9a-f]{40}", sha)
         and environ.get("GITHUB_WORKFLOW_SHA") == sha
         and environ.get("GITHUB_RUN_ATTEMPT") == "1", "untrusted invocation; use a fresh main dispatch")

    def env_id(name):
        value = environ.get(name, "")
        need(re.fullmatch(r"[1-9][0-9]{0,18}", value), "missing invocation identity")
        return integer(int(value))

    return {"repository": REPOSITORY, "repository_id": env_id("GITHUB_REPOSITORY_ID"),
            "owner_id": env_id("GITHUB_REPOSITORY_OWNER_ID"), "ref": REF, "event": event,
            "sha": sha, "workflow_ref": workflow_ref, "workflow_sha": sha,
            "run_id": env_id("GITHUB_RUN_ID"), "run_attempt": 1}


def repository_identity(value):
    value = obj(value)
    owner = obj(value.get("owner"))
    need(value.get("full_name") == REPOSITORY and owner.get("login") == "kira-manga",
         "wrong repository identity")
    return {"id": integer(value.get("id")), "full_name": REPOSITORY,
            "owner_id": integer(owner.get("id"))}


def policy_fingerprint(repository, environment, branches, protection):
    environment, protection = obj(environment), obj(protection)
    need(environment.get("name") == "production" and environment.get("can_admins_bypass") is False,
         "production approval is missing or bypassable")
    environment_id = integer(environment.get("id"))
    flags = obj(environment.get("deployment_branch_policy"))
    need(set(flags) == {"protected_branches", "custom_branch_policies"}
         and flags["protected_branches"] is False and flags["custom_branch_policies"] is True,
         "native exact-main environment policy required")
    refs = complete_list(branches, "branch_policies")
    need(len(refs) == 1 and refs[0].get("name") == "main" and refs[0].get("type") == "branch",
         "extra or unsupported deployment ref")
    ref_id = integer(refs[0].get("id"))

    rules = environment.get("protection_rules")
    need(type(rules) is list and 1 <= len(rules) <= 2, "unsupported environment protection rules")
    by_type = {}
    for rule in rules:
        rule = obj(rule)
        kind = rule.get("type")
        need(type(kind) is str and kind in {"required_reviewers", "branch_policy"} and kind not in by_type,
             "duplicate or unsupported environment rule")
        if kind == "branch_policy":
            # GitHub's documented native marker is optional metadata, NOT approval.
            need(set(rule) <= {"type", "id", "node_id"}, "unsupported native branch-policy marker")
            if "id" in rule:
                integer(rule["id"])
            if "node_id" in rule:
                need(type(rule["node_id"]) is str and 0 < len(rule["node_id"]) <= 200,
                     "invalid native branch-policy marker")
        by_type[kind] = rule
    reviewers_rule = obj(by_type.get("required_reviewers"))
    need(reviewers_rule.get("prevent_self_review") is True, "non-self native approval required")
    reviewers = reviewers_rule.get("reviewers")
    need(type(reviewers) is list and 1 <= len(reviewers) <= 6, "explicit human reviewer IDs required")
    users = []
    for entry in reviewers:
        entry = obj(entry)
        user = obj(entry.get("reviewer"))
        need(entry.get("type") == "User" and user.get("type") == "User"
             and type(user.get("login")) is str
             and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9-]{0,38}", user["login"]),
             "only explicit User reviewers are supported")
        users.append(integer(user.get("id")))
    need(len(set(users)) == len(users), "duplicate reviewer identity")

    need(obj(protection.get("enforce_admins")).get("enabled") is True
         and obj(protection.get("allow_force_pushes")).get("enabled") is False
         and obj(protection.get("allow_deletions")).get("enabled") is False,
         "main protection is bypassable")
    reviews = obj(protection.get("required_pull_request_reviews"))
    count = integer(reviews.get("required_approving_review_count"))
    need(count <= 6 and reviews.get("dismiss_stale_reviews") is True
         and reviews.get("require_last_push_approval") is True
         and reviews.get("bypass_pull_request_allowances") == {"users": [], "teams": [], "apps": []},
         "enforcing source/workflow PR review required")
    checks = obj(protection.get("required_status_checks"))
    required = checks.get("checks")
    need(checks.get("strict") is True and checks.get("contexts") == ["web-verify"]
         and type(required) is list and len(required) == 1
         and obj(required[0]).get("context") == "web-verify"
         and integer(required[0].get("app_id")) == GITHUB_ACTIONS_APP_ID,
         "strict GitHub Actions web-verify protection required")
    # Only enforced values and stable identities; no avatars, timestamps or rule decoration.
    enforced = {"repository": repository, "environment_id": environment_id, "environment": "production",
                "reviewers": sorted(users), "prevent_self_review": True, "can_admins_bypass": False,
                "branch_policy": {"id": ref_id, "type": "branch", "name": "main"},
                "deployment_branch_policy": flags, "enforce_admins": True,
                "allow_force_pushes": False, "allow_deletions": False,
                "approving_reviews": count, "dismiss_stale_reviews": True,
                "require_last_push_approval": True, "review_bypass": False,
                "strict_checks": True, "checks": [["web-verify", GITHUB_ACTIONS_APP_ID]]}
    return hashlib.sha256(canonical(enforced).encode("utf-8")).hexdigest()


def read_policy(api, ctx):
    repository = obj(api.get(""))
    identity = repository_identity(repository)
    need(identity["id"] == ctx["repository_id"] and identity["owner_id"] == ctx["owner_id"]
         and repository.get("fork") is False and repository.get("archived") is False
         and repository.get("disabled") is False and repository.get("default_branch") == "main",
         "repository policy mismatch")
    fingerprint = policy_fingerprint(identity, api.get("/environments/production"),
                                     api.get(BRANCH_POLICIES), api.get(PROTECTION))
    return identity, fingerprint


def run_identity(value, repository, workflow_id, sha):
    value = obj(value)
    need(repository_identity(value.get("repository")) == repository
         and repository_identity(value.get("head_repository")) == repository,
         "verification repository mismatch")
    need(integer(value.get("workflow_id")) == workflow_id and value.get("path") == VERIFY_WORKFLOW
         and value.get("event") == "push" and value.get("head_branch") == "main"
         and value.get("head_sha") == sha and value.get("status") == "completed"
         and value.get("conclusion") == "success", "trusted push/main verification is not successful")
    return {"workflow_id": workflow_id, "workflow_path": VERIFY_WORKFLOW, "sha": sha,
            "run_id": integer(value.get("id")), "run_attempt": integer(value.get("run_attempt"))}


def verified_source(api, repository, sha, selected=None):
    workflow = obj(api.get("/actions/workflows/verify.yml"))
    need(workflow.get("path") == VERIFY_WORKFLOW and workflow.get("state") == "active",
         "fixed verification workflow is not active")
    workflow_id = integer(workflow.get("id"))
    if selected is None:
        runs = complete_list(api.get(f"/actions/workflows/{workflow_id}/runs?event=push&branch=main&"
                                     f"head_sha={sha}&per_page=100&page=1"), "workflow_runs")
        need(len(runs) == 1, "missing or ambiguous exact-SHA verification run")
        pinned = run_identity(runs[0], repository, workflow_id, sha)
    else:
        pinned = {key: selected[key] for key in RUN_KEYS}
        need(pinned["workflow_id"] == workflow_id, "verification workflow identity changed")
    path = f"/actions/runs/{pinned['run_id']}"
    attempt_path = path + f"/attempts/{pinned['run_attempt']}"
    for endpoint in (path, attempt_path):
        need(run_identity(api.get(endpoint), repository, workflow_id, sha) == pinned,
             "verification run or attempt changed")
    jobs = complete_list(api.get(attempt_path + "/jobs?per_page=100&page=1"), "jobs")
    need(len(jobs) == 1, "missing or ambiguous verification job")
    job = jobs[0]
    need(job.get("name") == "web-verify" and integer(job.get("run_id")) == pinned["run_id"]
         and integer(job.get("run_attempt")) == pinned["run_attempt"]
         and job.get("head_sha") == sha and job.get("head_branch") == "main"
         and job.get("status") == "completed" and job.get("conclusion") == "success",
         "actual web-verify job is not successful")
    result = {**pinned, "job_id": integer(job.get("id"))}
    # Catch a rerun that started while reading the pinned attempt/jobs as well.
    need(run_identity(api.get(path), repository, workflow_id, sha) == pinned,
         "current verification attempt changed")
    if selected is not None:
        need(result == selected, "frozen verification identity changed")
    return result


def current_main(api, sha):
    main = obj(api.get("/git/ref/heads/main"))
    commit = obj(main.get("object"))
    need(main.get("ref") == REF and commit.get("type") == "commit" and commit.get("sha") == sha,
         "dispatch revision is no longer current main")


def parse_snapshot(raw, ctx):
    need(type(raw) is str and 0 < len(raw) <= 8192, "missing or oversized preflight snapshot")
    frozen = decode_object(raw)
    need(set(frozen) == {"version", "deployment", "policy_sha256", "verification"}
         and type(frozen["version"]) is int and frozen["version"] == 1
         and canonical(frozen["deployment"]) == canonical(ctx), "preflight invocation changed")
    fingerprint = frozen["policy_sha256"]
    need(type(fingerprint) is str and re.fullmatch(r"[0-9a-f]{64}", fingerprint),
         "invalid preflight policy fingerprint")
    selected = obj(frozen["verification"])
    need(set(selected) == RUN_KEYS | {"job_id"} and selected.get("sha") == ctx["sha"]
         and selected.get("workflow_path") == VERIFY_WORKFLOW, "invalid preflight source binding")
    for key in ("workflow_id", "run_id", "run_attempt", "job_id"):
        integer(selected[key])
    return frozen


def snapshot(api, ctx, frozen=None):
    repository, fingerprint = read_policy(api, ctx)
    verification = verified_source(api, repository, ctx["sha"],
                                   frozen["verification"] if frozen is not None else None)
    current_main(api, ctx["sha"])
    observed = {"version": 1, "deployment": ctx, "policy_sha256": fingerprint, "verification": verification}
    if frozen is not None:
        need(canonical(observed) == canonical(frozen), "frozen preflight policy or identity changed")
    return observed


def main(argv=None):
    try:
        args = sys.argv[1:] if argv is None else argv
        need(len(args) == 1 and args[0] in {"preflight", "recheck", "drift"}, "unsupported gate mode")
        mode = args[0]
        ctx = context(os.environ, drift=mode == "drift")
        frozen = parse_snapshot(os.environ.get("WEB_DEPLOYMENT_SNAPSHOT"), ctx) if mode == "recheck" else None
        output = os.environ.get("GITHUB_OUTPUT")
        need(mode != "preflight" or output, "missing preflight output channel")
        api = Api(os.environ.get("GH_READ_TOKEN"), os.environ.get("GH_POLICY_READ_TOKEN"))
        if mode == "drift":
            read_policy(api, ctx)
            current_main(api, ctx["sha"])
            print("Supported native production policy is present; no deployment performed.")
        else:
            observed = snapshot(api, ctx, frozen)
            if mode == "preflight":
                with open(output, "a", encoding="utf-8") as channel:
                    channel.write("snapshot=" + canonical(observed) + "\n")
                verified = observed["verification"]
                print(f"Frozen SHA {ctx['sha']}; verification run {verified['run_id']}, "
                      f"attempt {verified['run_attempt']}, job {verified['job_id']}; "
                      f"policy SHA-256 {observed['policy_sha256']}.")
                print("Preflight frozen; native production approval is still required.")
            else:
                # Never replace/re-emit the baseline after approval or after the build.
                print("Frozen preflight policy, source and verification evidence unchanged.")
        return 0
    except Refused as error:
        print("Deployment gate refused: " + str(error), file=sys.stderr)
        return 1
    except Exception:
        # Never print API bodies, credentials, environment values or raw exceptions.
        print("Deployment gate refused: metadata or local gate unavailable", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
