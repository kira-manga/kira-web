// Server-only: used by the validated tutorial cache callback, never by browser code.
export type TutorialTransportFailureKind = 'config' | 'network' | 'http' | 'timeout' | 'oversize' | 'json';

export class TutorialTransportFailure extends Error {
  constructor(readonly kind: TutorialTransportFailureKind) {
    super(`Tutorial API unavailable (${kind})`);
    this.name = 'TutorialTransportFailure';
  }
}

function configuredInteger(name: string, fallback: number, minimum: number, maximum: number): number {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  if (raw.length > String(maximum).length || !/^[1-9][0-9]*$/.test(raw)) {
    throw new TutorialTransportFailure('config');
  }
  const value = Number(raw);
  if (value < minimum || value > maximum) throw new TutorialTransportFailure('config');
  return value;
}

type TutorialJsonResult = { status: 'ok'; data: unknown } | { status: 'not-found' };

export async function fetchTutorialJson(url: string, authoritativeNotFound: boolean): Promise<TutorialJsonResult> {
  // Runtime only, before upstream access. Absence alone selects defaults; no raw config is logged.
  const timeoutMs = configuredInteger('KIRA_TUTORIAL_TIMEOUT_MS', 5000, 100, 5000);
  const maximumBytes = configuredInteger('KIRA_TUTORIAL_MAX_RESPONSE_BYTES', 2_097_152, 4096, 2_097_152);
  const controller = new AbortController();
  let timedOut = false;
  const deadline = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  let response: Response | undefined;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let consumed = false;
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (timedOut) throw new TutorialTransportFailure('timeout');
    // The status is authoritative independently of an unused, potentially endless error body.
    if (authoritativeNotFound && response.status === 404) return { status: 'not-found' };
    if (!response.ok) throw new TutorialTransportFailure('http');

    const encoding = response.headers.get('content-encoding')?.trim().toLowerCase();
    const length = response.headers.get('content-length');
    if ((!encoding || encoding === 'identity') && length && /^[0-9]+$/.test(length) && Number(length) > maximumBytes) {
      throw new TutorialTransportFailure('oversize');
    }
    if (!response.body) throw new TutorialTransportFailure('json');
    reader = response.body.getReader();
    // Grow geometrically, not once per tiny chunk or to the maximum for every small request.
    let bytes = new Uint8Array(0);
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (timedOut) throw new TutorialTransportFailure('timeout');
      if (done) { consumed = true; break; }
      const nextSize = received + value.byteLength;
      // Native fetch exposes decoded bytes. Check before retaining/copying/decoding this chunk.
      if (nextSize > maximumBytes) throw new TutorialTransportFailure('oversize');
      if (nextSize > bytes.byteLength) {
        const grown = new Uint8Array(Math.min(maximumBytes, Math.max(nextSize, bytes.byteLength * 2, 4096)));
        grown.set(bytes.subarray(0, received));
        bytes = grown;
      }
      bytes.set(value, received);
      received = nextSize;
    }
    try {
      // Match fetch's UTF-8 BOM/replacement behavior, including split multibyte sequences.
      // Parsing is byte-bounded synchronous work, not preemptible by an event-loop timer.
      return { status: 'ok', data: JSON.parse(new TextDecoder().decode(bytes.subarray(0, received))) as unknown };
    } catch {
      throw new TutorialTransportFailure('json');
    }
  } catch (error) {
    if (timedOut) throw new TutorialTransportFailure('timeout');
    if (error instanceof TutorialTransportFailure) throw error;
    throw new TutorialTransportFailure('network');
  } finally {
    clearTimeout(deadline);
    if (!consumed) {
      controller.abort();
      // Abort the native producer first. Cleanup must not await an unbounded cancel promise
      // or replace an authoritative404 with a cancellation error.
      try {
        const cancellation = reader ? reader.cancel() : response?.body?.cancel();
        void cancellation?.catch(() => {});
      } catch { /* Best-effort cancellation after native abort. */ }
    }
    try { reader?.releaseLock(); } catch { /* Cleanup must not replace the sanitized result. */ }
  }
}
