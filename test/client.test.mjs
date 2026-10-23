import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { requestTool, describeRequest } from '../client/index.mjs';

test('birth dates stay in a JSON POST; only fixed official hosts are used', () => {
  const request = describeRequest('matrix', { date: '1990-06-15' });
  assert.equal(request.method, 'POST'); assert.ok(!request.url.includes('1990')); assert.equal(JSON.parse(request.body).date, '1990-06-15');
  assert.throws(() => describeRequest('matrix', { date: '1990-06-15', url: 'https://untrusted.example' }));
  assert.throws(() => describeRequest('names', { count: 1000 }));
});
test('429 is surfaced without automatic retries and includes the wait', async () => {
  let calls = 0;
  await assert.rejects(requestTool('names', {}, { fetchImpl: async () => { calls++; return new Response(JSON.stringify({ error: { code: 'client_rate_limit', message: 'private details ignored' } }), { status: 429, headers: { 'Retry-After': '2' } }); } }), e => e.status === 429 && e.retryAfter === 2 && !e.message.includes('private'));
  assert.equal(calls, 1);
});
test('response body is bounded even without a length header', async () => {
  await assert.rejects(requestTool('names', {}, { fetchImpl: async () => new Response('x'.repeat(32769)) }), /exceeds/);
});
test('CLI help, invalid command and stdin dry-run perform no network calls', () => {
  const run = (args, input) => spawnSync(process.execPath, ['bin/lucernel-tools.mjs', ...args], { encoding: 'utf8', input });
  assert.equal(run(['--help']).status, 0);
  assert.equal(run(['--version']).stdout.trim(), '0.1.1');
  assert.equal(run(['unknown', '--dry-run']).status, 2);
  const result = run(['matrix', '--stdin-json', '--dry-run'], '{"date":"1990-06-15"}');
  assert.equal(result.status, 0); assert.equal(JSON.parse(result.stdout).dryRun, true);
  assert.equal(run(['matrix', '--stdin-json', '--dry-run'], 'x'.repeat(2100)).status, 2);
});
