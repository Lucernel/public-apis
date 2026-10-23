const endpoints = Object.freeze({
  matrix: ['POST', 'https://matricedeldestino.it/api/public/v1/matrix'],
  couple: ['POST', 'https://matricedeldestino.it/api/public/v1/couple'],
  'angel-number': ['POST', 'https://istruzionemessina.it/api/public/v1/angel-number.php'],
  verse: ['GET', 'https://lucernel.com/api/public/v1/daily-verse'],
  names: ['GET', 'https://musael.com/api/public/v1/names'],
});
const allowed = { matrix: ['date'], couple: ['first_date', 'second_date'], 'angel-number': ['date'], verse: ['date'], names: ['kind', 'seed', 'count'] };
export function describeRequest(tool, input = {}) {
  if (!Object.hasOwn(endpoints, tool)) throw new Error('Unknown tool. Use --help to list commands.');
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(k => !allowed[tool].includes(k))) throw new Error('Unsupported input field. Use --help for this command.');
  const [method, endpoint] = endpoints[tool];
  const url = new URL(endpoint);
  for (const field of allowed[tool].filter(k => k.includes('date'))) {
    const value = input[field];
    if (value === undefined && tool === 'verse') continue;
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`Provide ${field} as YYYY-MM-DD.`);
  }
  for (const [field, max] of [['seed', 999999], ['count', 20]]) {
    if (input[field] !== undefined && (!Number.isSafeInteger(input[field]) || input[field] < 1 || input[field] > max)) throw new Error(`${field} must be an integer from 1 through ${max}.`);
  }
  if (input.kind !== undefined && (typeof input.kind !== 'string' || !/^[a-z][a-z-]{0,39}$/.test(input.kind))) throw new Error('kind must be a supported generator name.');
  if (method === 'GET') for (const [key, value] of Object.entries(input)) url.searchParams.set(key, String(value));
  return { method, url: url.href, ...(method === 'POST' ? { body: JSON.stringify(input) } : {}) };
}

export class PublicToolsError extends Error {
  constructor(message, { status, code, retryAfter } = {}) { super(message); this.status = status; this.code = code; this.retryAfter = retryAfter; }
}

export async function requestTool(tool, input = {}, { fetchImpl = fetch, timeoutMs = 5000, signal } = {}) {
  const request = describeRequest(tool, input);
  const signals = [AbortSignal.timeout(timeoutMs), ...(signal ? [signal] : [])];
  const response = await fetchImpl(request.url, { method: request.method,
    headers: { Accept: 'application/json', 'User-Agent': 'OpenAI File Downloader, XaiImageApiFetch/1.0', ...(request.body ? { 'Content-Type': 'application/json' } : {}) },
    ...(request.body ? { body: request.body } : {}), signal: AbortSignal.any(signals), redirect: 'error',
  });
  if (!response.body) throw new PublicToolsError('The API returned an empty response.', { status: response.status });
  const reader = response.body.getReader(); const chunks = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 32768) throw new PublicToolsError('The API response exceeds the supported size.');
      chunks.push(value);
    }
  } finally { void reader.cancel().catch(() => {}); reader.releaseLock(); }
  let data;
  try { data = JSON.parse(Buffer.concat(chunks, size).toString('utf8')); }
  catch { throw new PublicToolsError('The API returned an invalid JSON response.', { status: response.status }); }
  if (!response.ok) {
    const value = response.headers.get('retry-after');
    const retryAfter = value && /^\d+$/.test(value) ? Math.min(Number(value), 86400) : undefined;
    const message = response.status === 429 ? 'Rate limit reached. Wait before trying again.' : response.status === 503 ? 'The API is temporarily busy.' : 'The API rejected the request.';
    throw new PublicToolsError(message, { status: response.status, code: typeof data.error?.code === 'string' ? data.error.code.slice(0, 80) : 'api_error', retryAfter });
  }
  if (data?.version !== '1' || data.error) throw new PublicToolsError('The API returned an unsupported response.');
  return data;
}
