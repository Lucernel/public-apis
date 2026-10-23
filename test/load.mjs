// Local-only benchmark: a bounded adapter, no external network or live API calls.
import { createServer } from 'node:http';
import { performance } from 'node:perf_hooks';
import { createGuard, ApiError } from '../server/guard.mjs';
import assert from 'node:assert/strict';
const guard = createGuard();
const server = createServer((req, res) => {
  let release;
  try { release = guard.acquire(req.socket.remoteAddress); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"version":"1","ok":true}'); }
  catch (e) { assert.ok(e instanceof ApiError); res.writeHead(e.status, { 'Retry-After': String(e.retryAfter) }); res.end('{}'); }
  finally { release?.(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const startMemory = process.memoryUsage();
const statuses = {}; const times = []; let index = 0;
const start = performance.now();
try {
  await Promise.all(Array.from({ length: 16 }, async () => {
    while (index++ < 1000) {
      const begin = performance.now();
      const response = await fetch(`http://127.0.0.1:${server.address().port}`, { headers: { 'User-Agent': 'OpenAI File Downloader, XaiImageApiFetch/1.0', 'X-Forwarded-For': `192.0.2.${index % 254 + 1}` } });
      await response.arrayBuffer(); times.push(performance.now() - begin);
      statuses[response.status] = (statuses[response.status] ?? 0) + 1;
    }
  }));
  const elapsedMs = performance.now() - start;
  assert.equal(statuses[200] + statuses[429], 1000);
  assert.ok(statuses[200] <= 10 + Math.ceil(elapsedMs / 2000));
  assert.equal(guard.stats().clients, 1); assert.equal(guard.stats().inFlight, 0);
  times.sort((a,b) => a-b);
  global.gc?.();
  const endMemory = process.memoryUsage();
  console.log(JSON.stringify({ requests: 1000, concurrency: 16, elapsedMs, statuses, p50Ms: times[499], p95Ms: times[949], p99Ms: times[989], heapDeltaBytes: endMemory.heapUsed - startMemory.heapUsed, rssBytes: endMemory.rss, guard: guard.stats() }, null, 2));
} finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
