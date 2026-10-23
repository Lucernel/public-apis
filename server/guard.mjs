import { createHmac, randomBytes } from 'node:crypto';
import { isIP } from 'node:net';

export class ApiError extends Error {
  constructor(status, code, message, retryAfter) {
    super(message);
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

// One IPv6 /64 is one client. Neither alternative spellings nor mapped IPv4
// addresses create extra budgets. The caller must supply a verified address.
export function networkPrefix(address) {
  if (typeof address !== 'string' || address.length > 45 || address.includes('%')) return null;
  const kind = isIP(address);
  if (kind === 4) return address;
  if (kind !== 6) return null;
  let value = address.toLowerCase();
  if (value.includes('.')) {
    const colon = value.lastIndexOf(':');
    const bytes = value.slice(colon + 1).split('.').map(Number);
    value = value.slice(0, colon + 1) + ((bytes[0] << 8) | bytes[1]).toString(16) + ':' + ((bytes[2] << 8) | bytes[3]).toString(16);
  }
  const halves = value.split('::');
  const left = halves[0] ? halves[0].split(':') : [];
  const right = halves[1] ? halves[1].split(':') : [];
  const words = halves.length === 2 ? [...left, ...Array(8 - left.length - right.length).fill('0'), ...right] : left;
  const parts = words.map(x => parseInt(x, 16));
  if (parts.slice(0, 5).every(x => x === 0) && parts[5] === 65535) {
    return [parts[6] >> 8, parts[6] & 255, parts[7] >> 8, parts[7] & 255].join('.');
  }
  return parts.slice(0, 4).map(x => x.toString(16)).join(':') + '::/64';
}

export function createGuard({ clock = () => performance.now(), secret = randomBytes(32), maxClients = 2048, maxInFlight = 8,
  clientInterval = 2000, clientBurst = 10, globalInterval = 100, globalBurst = 20, ttl = 120000 } = {}) {
  for (const n of [maxClients, maxInFlight, clientInterval, clientBurst, globalInterval, globalBurst, ttl]) {
    if (!Number.isSafeInteger(n) || n < 1) throw new Error('Invalid public API guard configuration');
  }
  if (ttl < clientInterval * clientBurst) throw new Error('Guard TTL must cover the full client refill');
  const clients = new Map();
  let globalTat = 0, inFlight = 0, lastNow = 0;
  return {
    acquire(address) {
      const prefix = networkPrefix(address);
      if (!prefix) throw new ApiError(503, 'client_address_unavailable', 'The API cannot verify the client connection.', 30);
      const now = Math.max(lastNow, clock()); lastNow = now;
      // Map insertion order is last admitted use; bounded cleanup, never a full scan.
      let scanned = 0;
      for (const [key, state] of clients) {
        if (scanned++ >= 64 || now - state.used < ttl) break;
        clients.delete(key);
      }
      const key = createHmac('sha256', secret).update(prefix).digest('hex');
      const previous = clients.get(key);
      const clientWait = (previous?.tat ?? 0) - (clientBurst - 1) * clientInterval - now;
      if (clientWait > 0) throw new ApiError(429, 'client_rate_limit', 'Too many requests from this client. Wait before retrying.', Math.max(1, Math.ceil(clientWait / 1000)));
      const globalWait = globalTat - (globalBurst - 1) * globalInterval - now;
      if (globalWait > 0) throw new ApiError(429, 'service_rate_limit', 'The public API is at capacity. Wait before retrying.', Math.max(1, Math.ceil(globalWait / 1000)));
      if (inFlight >= maxInFlight || (!previous && clients.size >= maxClients)) {
        throw new ApiError(503, 'service_busy', 'The public API is busy. Try again later.', 2);
      }
      clients.delete(key);
      clients.set(key, { tat: Math.max(previous?.tat ?? 0, now) + clientInterval, used: now });
      globalTat = Math.max(globalTat, now) + globalInterval;
      inFlight++;
      let released = false;
      return () => { if (!released) { released = true; inFlight--; } };
    },
    // Counts only: never expose client identifiers or keys.
    stats: () => ({ clients: clients.size, inFlight, maxClients, maxInFlight }),
  };
}

export function apiResponse(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Expose-Headers': 'Retry-After',
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex',
    ...extra,
  } });
}

export function errorResponse(error) {
  const expected = error instanceof ApiError;
  return apiResponse({ error: {
    code: expected ? error.code : 'internal_error',
    message: expected ? error.message : 'The request could not be completed.',
  } }, expected ? error.status : 500, expected && error.retryAfter ? { 'Retry-After': String(error.retryAfter) } : {});
}

export async function readJson(request, { maxBytes = 2048, timeoutMs = 2000 } = {}) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') ?? '')) throw new ApiError(415, 'content_type', 'Use application/json.');
  const encoding = request.headers.get('content-encoding');
  if (encoding && encoding !== 'identity') throw new ApiError(415, 'content_encoding', 'Compressed request bodies are not accepted.');
  const length = request.headers.get('content-length');
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > maxBytes)) throw new ApiError(413, 'body_too_large', 'The request body exceeds 2048 bytes.');
  if (!request.body) throw new ApiError(400, 'invalid_json', 'A JSON object is required.');
  const reader = request.body.getReader();
  const chunks = []; let size = 0; let timer;
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new ApiError(408, 'body_timeout', 'The request body took too long.')), timeoutMs); });
  try {
    while (true) {
      const { done, value } = await Promise.race([reader.read(), timeout]);
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) throw new ApiError(413, 'body_too_large', 'The request body exceeds 2048 bytes.');
      chunks.push(value);
    }
    let parsed;
    try { parsed = JSON.parse(Buffer.concat(chunks, size).toString('utf8')); }
    catch { throw new ApiError(400, 'invalid_json', 'A valid JSON object is required.'); }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new ApiError(400, 'invalid_json', 'A JSON object is required.');
    return parsed;
  } finally {
    clearTimeout(timer);
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export function onlyKeys(value, allowed) {
  if (Object.keys(value).some(key => !allowed.includes(key))) throw new ApiError(400, 'unknown_parameter', 'The request contains an unsupported parameter.');
}

export function dateParts(value, { birth = true, now = new Date() } = {}) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new ApiError(400, 'invalid_date', 'Use a valid date in YYYY-MM-DD format.');
  const [year, month, day] = value.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  if (year < 1900 || year > 2100 || d.getUTCFullYear() !== year || d.getUTCMonth() + 1 !== month || d.getUTCDate() !== day || (birth && value > now.toISOString().slice(0, 10))) {
    throw new ApiError(400, 'invalid_date', birth ? 'Use an existing date from 1900 through today (UTC).' : 'Use an existing date from 1900 through 2100.');
  }
  return { year, month, day };
}

export async function withGuard(request, address, guard, method, run) {
  let release;
  try {
    release = guard.acquire(address);
    if (request.url.length > 1024) throw new ApiError(414, 'url_too_long', 'The request URL is too long.');
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
      'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': `${method}, OPTIONS`,
      'Access-Control-Allow-Headers': 'Accept, Content-Type', 'Access-Control-Max-Age': '600', 'Cache-Control': 'no-store',
    } });
    if (request.method !== method) return apiResponse({ error: { code: 'method_not_allowed', message: `Use ${method}.` } }, 405, { Allow: `${method}, OPTIONS` });
    return apiResponse({ version: '1', ...await run() });
  } catch (error) { return errorResponse(error); }
  finally { release?.(); }
}
