import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, createGuard, networkPrefix, readJson, dateParts, withGuard } from '../server/guard.mjs';

test('equivalent IP spellings share a quota, IPv6 rotates only within its /64', () => {
  assert.equal(networkPrefix('::ffff:192.0.2.5'), '192.0.2.5');
  assert.equal(networkPrefix('0:0:0:0:0:ffff:c000:205'), '192.0.2.5');
  assert.equal(networkPrefix('2001:db8:0:1::1'), networkPrefix('2001:0db8:0000:0001:ffff::a'));
  assert.notEqual(networkPrefix('2001:db8:0:1::1'), networkPrefix('2001:db8:0:2::1'));
  for (const bad of ['1.2.3.999', '192.0.2.1, 1.1.1.1', 'fe80::1%eth0', 'unknown', '', null]) assert.equal(networkPrefix(bad), null);
});
test('client burst, refill, backwards clock, idempotent release', () => {
  let now = 1000; const guard = createGuard({ clock: () => now });
  for (let i = 0; i < 10; i++) { const release = guard.acquire('192.0.2.1'); release(); release(); }
  assert.throws(() => guard.acquire('192.0.2.1'), e => e.status === 429 && e.code === 'client_rate_limit' && e.retryAfter === 2);
  now = 2999; assert.throws(() => guard.acquire('192.0.2.1'), ApiError);
  now = 3000; guard.acquire('192.0.2.1')();
  now = 0; assert.throws(() => guard.acquire('192.0.2.1'), ApiError);
  assert.equal(guard.stats().inFlight, 0);
});
test('many origins cannot evade the global budget', () => {
  let now = 0; const guard = createGuard({ clock: () => now });
  for (let i = 1; i <= 20; i++) guard.acquire(`192.0.2.${i}`)();
  for (let i = 21; i <= 200; i++) assert.throws(() => guard.acquire(`192.0.2.${i}`), e => e.code === 'service_rate_limit');
  assert.equal(guard.stats().clients, 20);
  now = 100; guard.acquire('192.0.2.201')();
});
test('client map remains bounded and refuses churn until inactive records expire', () => {
  let now = 0; const guard = createGuard({ clock: () => now, maxClients: 4 });
  for (let i = 1; i <= 4; i++) guard.acquire(`192.0.2.${i}`)();
  assert.throws(() => guard.acquire('192.0.2.5'), e => e.code === 'service_busy');
  assert.equal(guard.stats().clients, 4);
  now = 120000; guard.acquire('192.0.2.5')(); assert.equal(guard.stats().clients, 1);
});
test('in-flight limit has no waiting queue and releases after failure', async () => {
  const guard = createGuard(); const releases = [];
  for (let i = 1; i <= 8; i++) releases.push(guard.acquire(`192.0.2.${i}`));
  assert.throws(() => guard.acquire('192.0.2.9'), e => e.code === 'service_busy');
  releases.forEach(fn => fn());
  const response = await withGuard(new Request('https://example.com/', { method: 'POST' }), '192.0.2.10', guard, 'POST', () => { throw new Error('private implementation detail'); });
  assert.equal(response.status, 500); assert.doesNotMatch(await response.text(), /private implementation/);
  assert.equal(guard.stats().inFlight, 0);
});
test('size bounds apply to streamed requests without Content-Length', async () => {
  const request = new Request('https://example.com/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: new ReadableStream({ start(c) { c.enqueue(new Uint8Array(2049)); c.close(); } }), duplex: 'half' });
  await assert.rejects(readJson(request), e => e.status === 413);
  for (const body of ['[]', 'null', '{']) await assert.rejects(readJson(new Request('https://example.com/', { method: 'POST', headers: { 'content-type': 'application/json' }, body })), e => e.status === 400);
});
test('slow body deadline terminates and returns a slot', async () => {
  let cancelled = false;
  const request = new Request('https://example.com/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: new ReadableStream({ cancel() { cancelled = true; } }), duplex: 'half' });
  await assert.rejects(readJson(request, { timeoutMs: 10 }), e => e.status === 408);
  assert.equal(cancelled, true);
});
test('calendar validation rejects rollovers, future birth dates and non-string dates', () => {
  assert.deepEqual(dateParts('2000-02-29'), { year: 2000, month: 2, day: 29 });
  for (const value of ['1900-02-29', '2000-04-31', '2000-00-01', '2100-01-01', '100000-01-01', 20000101]) assert.throws(() => dateParts(value, { now: new Date('2026-10-23') }), ApiError);
});
test('a spoofed header never determines identity in the common guard', async () => {
  const guard = createGuard({ clock: () => 1000 });
  for (let i = 0; i < 10; i++) {
    const request = new Request('https://example.com/', { headers: { 'x-forwarded-for': `192.0.2.${i + 1}`, 'cf-connecting-ip': `198.51.100.${i + 1}` } });
    assert.equal((await withGuard(request, '203.0.113.1', guard, 'GET', () => ({ ok: true }))).status, 200);
  }
  const response = await withGuard(new Request('https://example.com/'), '203.0.113.1', guard, 'GET', () => ({ ok: true }));
  assert.equal(response.status, 429); assert.equal(response.headers.get('Retry-After'), '2');
});
