import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trustedClientResolver } from '../server/client-address.mjs';
test('untrusted peers cannot spoof forwarded headers', () => {
  const resolve = trustedClientResolver(['127.0.0.1/32', '10.0.0.0/24']);
  assert.equal(resolve('192.0.2.8', new Headers({ 'x-forwarded-for': '203.0.113.5' })), '192.0.2.8');
  assert.equal(resolve('127.0.0.1', new Headers({ 'x-forwarded-for': '198.51.100.1, 192.0.2.8, 10.0.0.2' })), '192.0.2.8');
  assert.equal(resolve('::ffff:127.0.0.1', new Headers({ 'x-forwarded-for': '192.0.2.8' })), '192.0.2.8');
  assert.equal(resolve('127.0.0.1', new Headers({ 'x-forwarded-for': 'bad, 192.0.2.8' })), null);
  assert.equal(resolve('127.0.0.1', new Headers()), null);
});
test('dedicated proxy headers require exactly one IP and an allowed peer', () => {
  const resolve = trustedClientResolver(['10.0.0.2'], 'cf-connecting-ip');
  assert.equal(resolve('10.0.0.2', new Headers({ 'cf-connecting-ip': '192.0.2.1' })), '192.0.2.1');
  assert.equal(resolve('10.0.0.3', new Headers({ 'cf-connecting-ip': '192.0.2.1' })), '10.0.0.3');
  assert.equal(resolve('10.0.0.2', new Headers({ 'cf-connecting-ip': '192.0.2.1, 192.0.2.2' })), null);
  assert.throws(() => trustedClientResolver(['not-an-ip']));
  assert.throws(() => trustedClientResolver(['0.0.0.0/33']));
});
