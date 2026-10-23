import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../mcp/server.mjs';
test('MCP exposes five read-only tools, rejects excess input and preserves quota refusals without retry', async () => {
  let calls = 0;
  const server = createServer({ request: async (tool, input) => {
    calls++;
    if (tool === 'names') throw Object.assign(new Error('private details'), { status: 429, code: 'client_rate_limit', retryAfter: 2 });
    return { version: '1', number: 4, source: 'https://istruzionemessina.it/numeri-angelici-guida-completa/' };
  } });
  const client = new Client({ name: 'local-test', version: '1' });
  const [a,b] = InMemoryTransport.createLinkedPair();
  try {
    await Promise.all([server.connect(a), client.connect(b)]);
    const { tools } = await client.listTools(); assert.equal(tools.length, 5);
    assert.ok(tools.every(t => t.annotations.readOnlyHint));
    const good = await client.callTool({ name: 'angel_number', arguments: { date: '1990-06-15' } });
    assert.equal(good.structuredContent.number, 4);
    const refused = await client.callTool({ name: 'names', arguments: { count: 5 } });
    assert.equal(refused.isError, true); assert.equal(JSON.parse(refused.content[0].text).error.retryAfter, 2);
    const invalid = await client.callTool({ name: 'matrix', arguments: { date: '1990-06-15', secret: 'never-send' } });
    assert.equal(invalid.isError, true); assert.equal(calls, 2);
  } finally { await client.close(); await server.close(); }
});
