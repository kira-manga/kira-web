import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import ts from 'typescript';

// Exercise the actual helper with native fetch/HTTP, not mocked Response/getters or a new runner.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(root, 'src/lib/server-tutorial-transport.ts'), 'utf8');
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2017 },
}).outputText;
const { fetchTutorialJson, TutorialTransportFailure } = await import(
  `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
);
const timeoutName = 'KIRA_TUTORIAL_TIMEOUT_MS';
const bytesName = 'KIRA_TUTORIAL_MAX_RESPONSE_BYTES';
const maximumBytes = 2_097_152;
const cap = 4096;
const marker = 'fixture-sensitive';

function configure(timeout = '1000', bytes = String(cap)) {
  for (const [name, value] of [[timeoutName, timeout], [bytesName, bytes]]) {
    if (value === null) delete process.env[name];
    else process.env[name] = value;
  }
}

async function bounded(promise, milliseconds = 2000) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Transport did not settle within the test observer budget')), milliseconds);
    })]);
  } finally {
    clearTimeout(timer);
  }
}

function payload(bytes) {
  const prefix = Buffer.from('{"text":"مرحبا 🌍 ');
  const suffix = Buffer.from('"}');
  assert.ok(bytes >= prefix.length + suffix.length);
  return Buffer.concat([prefix, Buffer.alloc(bytes - prefix.length - suffix.length, 97), suffix]);
}

await test('bounded tutorial transport over one owned native HTTP fixture', { timeout: 45_000 }, async (t) => {
  const original = new Map([timeoutName, bytesName].map((name) => [name, process.env[name]]));
  const records = [];
  const socketRecords = new Map();
  const timers = new Map();
  let sequence = 0;
  let tearingDown = false;
  let origin;
  const upstream = createServer((request, response) => {
    const url = new URL(request.url, 'http://fixture.test');
    const mode = url.pathname.slice(1);
    const record = { id: url.searchParams.get('id'), mode, method: request.method, accept: request.headers.accept,
      finished: false, closed: false, socketClosed: false, closedBeforeFinish: false, writes: 0, timers: new Set() };
    records.push(record);
    socketRecords.get(request.socket).push(record);
    response.on('error', () => {}); // Deliberate abort/framing fixtures must still reach cleanup.
    response.once('finish', () => { record.finished = true; });
    response.once('close', () => { record.closed = true; record.closedBeforeFinish = !response.writableFinished; });

    function schedule(action, milliseconds, repeat = false) {
      let timer;
      const stop = () => {
        if (repeat) clearInterval(timer); else clearTimeout(timer);
        timers.delete(timer);
        record.timers.delete(timer);
      };
      timer = (repeat ? setInterval : setTimeout)(() => {
        if (!repeat) stop();
        if (response.destroyed || response.writableEnded) { stop(); return; }
        action();
      }, milliseconds);
      timers.set(timer, stop);
      record.timers.add(timer);
      response.once('close', stop);
    }
    const write = (bytes) => { record.writes += 1; response.write(bytes); };
    if (mode === 'headers-stall') return;
    if (mode === 'network') { response.destroy(); return; }
    response.setHeader('Content-Type', 'application/json');
    if (mode === 'http' || mode === 'not-found') {
      response.statusCode = mode === 'http' ? 503 : 404;
      response.flushHeaders();
      write(marker);
      schedule(() => write(marker), 20, true);
      return;
    }
    if (mode === 'slow-body') {
      response.flushHeaders();
      write('{"text":"');
      schedule(() => write('a'), 15, true);
      return;
    }
    if (mode === 'declared-oversize') {
      response.setHeader('Content-Encoding', 'identity');
      response.setHeader('Content-Length', String(cap + 1));
      response.flushHeaders();
      write('['); // No EOF: an early refusal must really cancel the unused native body.
      return;
    }
    if (mode === 'stream-overflow') {
      response.flushHeaders();
      write(Buffer.alloc(cap, 32));
      schedule(() => write(' '), 30); // Real chunked overflow before EOF, not a declared-length test.
      return;
    }
    if (mode === 'malformed-length') {
      response.setHeader('Content-Length', 'not-a-length');
      response.end('{}');
      return;
    }
    if (mode === 'json') { response.end(`${marker} is not JSON`); return; }
    if (mode === 'replacement') { response.end(Buffer.from([0x22, 0xff, 0x22])); return; }
    if (mode === 'utf8') {
      const bytes = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('{"text":"مرحبا 🌍"}')]);
      let offset = 0;
      response.flushHeaders();
      schedule(() => {
        write(bytes.subarray(offset, ++offset));
        if (offset === bytes.length) response.end();
      }, 2, true);
      return;
    }
    const bytes = payload(Number(url.searchParams.get('size') ?? cap));
    if (mode === 'gzip' || mode === 'gzip-stored') {
      const compressed = gzipSync(bytes, mode === 'gzip-stored' ? { level: 0 } : undefined);
      record.encodedBytes = compressed.length;
      response.setHeader('Content-Encoding', 'gzip');
      response.setHeader('Content-Length', String(compressed.length));
      response.end(compressed);
    } else if (mode === 'chunked') {
      response.flushHeaders();
      write(bytes.subarray(0, 11)); // Includes a split UTF-8 sequence across real writes.
      schedule(() => response.end(bytes.subarray(11)), 10);
    } else if (mode === 'delayed') {
      schedule(() => response.end(bytes), Number(url.searchParams.get('wait') ?? 250));
    } else {
      assert.equal(mode, 'fixed');
      response.setHeader('Content-Length', String(bytes.length));
      response.end(bytes);
    }
  });
  upstream.on('connection', (socket) => {
    const entries = [];
    socketRecords.set(socket, entries);
    socket.once('close', () => {
      for (const record of entries) record.socketClosed = true;
      socketRecords.delete(socket);
    });
  });
  function operation(mode, query = {}, authoritativeNotFound = false) {
    const id = String(++sequence);
    const url = new URL(`/${mode}`, origin);
    for (const [name, value] of Object.entries({ id, secret: marker, ...query })) url.searchParams.set(name, String(value));
    return { id, promise: fetchTutorialJson(url.href, authoritativeNotFound) };
  }
  async function failed(operation, kind, observerMs = 2000) {
    await assert.rejects(bounded(operation.promise, observerMs), (error) => {
      assert.ok(error instanceof TutorialTransportFailure, 'Expected a sanitized typed transport failure');
      assert.equal(error.kind, kind);
      assert.equal(error.message, `Tutorial API unavailable (${kind})`);
      assert.equal(error.cause, undefined);
      assert.ok(!error.stack.includes(marker), 'Raw body/URL must not enter error diagnostics');
      return true;
    });
  }
  async function succeeded(operation, bytes) {
    const result = await bounded(operation.promise);
    assert.equal(result.status, 'ok');
    if (bytes !== undefined) assert.equal(Buffer.byteLength(JSON.stringify(result.data)), bytes);
    return result.data;
  }
  async function peerAborted(operation) {
    const end = Date.now() + 1500;
    let matching;
    while (Date.now() < end) {
      matching = records.filter((record) => record.id === operation.id);
      if (matching.length && matching.every((record) => record.closed && record.socketClosed)) break;
      await delay(10);
    }
    assert.equal(tearingDown, false, 'Fixture teardown must not be counted as client cancellation');
    assert.ok(matching?.length > 0, 'The fixture must have observed this operation');
    for (const record of matching) {
      assert.equal(record.finished, false, 'Normal response finish is not cancellation evidence');
      assert.equal(record.closedBeforeFinish, true);
      assert.equal(record.closed, true);
      assert.equal(record.socketClosed, true);
      assert.equal(record.timers.size, 0, 'Abort must stop the owned fixture writer');
    }
  }

  try {
    await new Promise((resolve, reject) => {
      upstream.once('error', reject);
      upstream.listen(0, '127.0.0.1', resolve);
    });
    origin = `http://127.0.0.1:${upstream.address().port}`;
    await t.test('strict runtime configuration refuses before any HTTP access', async () => {
      const start = records.length;
      const invalid = [
        [timeoutName, ['', '0', '99', '5001', '10000', '-100', '+100', '1.5', '1e3', '0x100', ' 100', '100 ', '00100', 'NaN', '100\n', marker]],
        [bytesName, ['', '0', '4095', '2097153', '-4096', '+4096', '4.096e3', '0x1000', ' 4096', '4096 ', '04096', 'Infinity', '1'.repeat(64)]],
      ];
      for (const [name, values] of invalid) {
        for (const value of values) {
          configure();
          process.env[name] = value;
          await failed(operation('headers-stall'), 'config');
        }
      }
      assert.equal(records.length, start);
    });

    await t.test('absent settings accept the exact 2MiB default and reject one decoded byte over', async () => {
      configure(null, null);
      await succeeded(operation('fixed', { size: maximumBytes }), maximumBytes);
      await failed(operation('chunked', { size: maximumBytes + 1 }), 'oversize');
      configure('5000', String(maximumBytes)); // Inclusive configured upper bounds also allow real HTTP.
      await succeeded(operation('fixed', { size: cap }), cap);
    });

    await t.test('fixed and genuinely chunked UTF-8 JSON is accepted below/at4096 and refused above', async () => {
      configure();
      for (const framing of ['fixed', 'chunked']) {
        for (const size of [cap - 1, cap]) await succeeded(operation(framing, { size }), size);
        await failed(operation(framing, { size: cap + 1 }), 'oversize');
      }
      assert.ok(records.filter((record) => ['fixed', 'chunked'].includes(record.mode))
        .every((record) => record.method === 'GET' && record.accept === 'application/json'));
    });

    await t.test('decoded gzip expansion is capped; a larger encoded but in-budget body is accepted', async () => {
      configure();
      const expansion = operation('gzip', { size: cap + 1 });
      await failed(expansion, 'oversize');
      assert.ok(records.find((record) => record.id === expansion.id).encodedBytes < cap);
      const stored = operation('gzip-stored', { size: cap });
      await succeeded(stored, cap);
      assert.ok(records.find((record) => record.id === stored.id).encodedBytes > cap,
        'Fixture must expose why encoded Content-Length is not a decoded-size limit');
    });

    await t.test('streamed split UTF-8/BOM and replacement decoding match fetch JSON behavior', async () => {
      configure();
      assert.deepEqual(await succeeded(operation('utf8')), { text: 'مرحبا 🌍' });
      assert.equal(await succeeded(operation('replacement')), '\ufffd');
    });

    await t.test('default5000ms header stall expires and closes the peer before teardown', async () => {
      configure(null, null);
      const start = performance.now();
      const stalled = operation('headers-stall');
      await failed(stalled, 'timeout', 7500);
      assert.ok(performance.now() - start >= 4500, 'Default must not silently use the short test override');
      await peerAborted(stalled);
    });

    await t.test('100ms deadline covers headers and a continually dripped body without renewing per chunk', async () => {
      configure('100');
      for (const mode of ['headers-stall', 'slow-body']) {
        const stalled = operation(mode);
        await failed(stalled, 'timeout');
        await peerAborted(stalled);
        if (mode === 'slow-body') assert.ok(records.find((record) => record.id === stalled.id).writes >= 3);
      }
    });

    await t.test('early identity-length and decoded overflow really abort unfinished producers', async () => {
      configure();
      for (const mode of ['declared-oversize', 'stream-overflow']) {
        const oversized = operation(mode);
        await failed(oversized, 'oversize');
        await peerAborted(oversized);
      }
    });

    await t.test('503/collection404 cancel unused flowing bodies; detail404 remains authoritative', async () => {
      configure();
      for (const mode of ['http', 'not-found']) {
        const refused = operation(mode);
        await failed(refused, 'http');
        await peerAborted(refused);
      }
      const archived = operation('not-found', {}, true);
      assert.deepEqual(await bounded(archived.promise), { status: 'not-found' });
      await peerAborted(archived);
    });

    await t.test('network, HTTP framing and JSON failures are sanitized, not content-size evidence', async () => {
      configure();
      await failed(operation('network'), 'network');
      await failed(operation('malformed-length'), 'network');
      await failed(operation('json'), 'json');
    });

    await t.test('overlapping operations keep independent budgets/controllers and later success still works', async () => {
      configure('100');
      const stalled = operation('headers-stall');
      let independentSettled = false;
      const refusal = failed(stalled, 'timeout').then(() => {
        assert.equal(independentSettled, false, 'The second operation must not extend the first deadline');
      });
      configure('1000');
      const independent = operation('delayed', { wait: 250 });
      await Promise.all([refusal, succeeded(independent, cap).then(() => { independentSettled = true; })]);
      await peerAborted(stalled);
      assert.ok(records.find((record) => record.id === independent.id).finished);
      await succeeded(operation('fixed'), cap);
      // Successful keep-alive connections need not close; only unfinished abort fixtures assert it.
    });
  } finally {
    tearingDown = true;
    for (const stop of [...timers.values()]) stop();
    upstream.closeAllConnections();
    await new Promise((resolve) => upstream.close(resolve));
    for (const [name, value] of original) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
    assert.equal(timers.size, 0);
    console.log('CLEANUP native transport fixture/writers stopped; no standalone/browser was started.');
  }
});
