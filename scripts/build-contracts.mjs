import { mkdir, writeFile } from 'node:fs/promises';
import { contracts, brands } from '../client/contracts.mjs';
const limits = 'No API key. Per client: burst 10, refill 30/minute. Shared service capacity: burst 20, refill 10/second; at most 8 in flight. Honor Retry-After on HTTP 429/503. POST JSON: maximum 2048 bytes. No automatic retries. Dates are sent in POST bodies, never URL parameters.';
const error = { description: 'Request rejected; inspect the HTTP status and error.code.', headers: { 'Retry-After': { description: 'Seconds to wait before a later attempt (429/503).', schema: { type: 'integer', minimum: 1 } } }, content: { 'application/json': { schema: { type: 'object', required: ['error'], properties: { error: { type: 'object', required: ['code', 'message'], properties: { code: { type: 'string' }, message: { type: 'string' } } } } } } } };
await mkdir(new URL('../openapi/', import.meta.url), { recursive: true });
await mkdir(new URL('../postman/', import.meta.url), { recursive: true });
for (const [id, brand] of Object.entries(brands)) {
  const description = brand.description + '\n\nOfficial website: [' + brand.name + '](' + brand.origin + ').\n\n' + limits;
  const paths = {}; const items = [];
  for (const contract of contracts.filter(c => c.brand === id)) {
    const operation = { operationId: contract.tool.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), summary: contract.title, description: contract.summary, responses: { 200: { description: 'Computed result.', content: { 'application/json': { schema: contract.output } } }, ...Object.fromEntries([400, 405, 408, 413, 414, 415, 429, 500, 503].map(code => [code, error])) } };
    if (contract.method === 'POST') operation.requestBody = { required: true, content: { 'application/json': { schema: contract.input, example: contract.example } } };
    else operation.parameters = Object.entries(contract.input.properties).map(([name, schema]) => ({ name, in: 'query', required: false, schema }));
    paths[contract.path] = { [contract.method.toLowerCase()]: operation };
    const url = new URL(contract.path, brand.origin);
    if (contract.method === 'GET') for (const [key, value] of Object.entries(contract.example)) url.searchParams.set(key, String(value));
    items.push({ name: contract.title, request: { method: contract.method, header: [{ key: 'Accept', value: 'application/json' }, { key: 'User-Agent', value: 'OpenAI File Downloader, XaiImageApiFetch/1.0' }, ...(contract.method === 'POST' ? [{ key: 'Content-Type', value: 'application/json' }] : [])], url: url.href, description: contract.summary + '\n\n' + limits, ...(contract.method === 'POST' ? { body: { mode: 'raw', raw: JSON.stringify(contract.example, null, 2), options: { raw: { language: 'json' } } } } : {}) }, event: [{ listen: 'test', script: { type: 'text/javascript', exec: ['pm.test("Response is JSON", () => pm.response.to.be.json);', 'pm.test("Version 1 or explicit refusal", () => { const body = pm.response.json(); if (pm.response.code === 200) pm.expect(body.version).to.eql("1"); else pm.expect(body).to.have.property("error"); });'] } }] });
  }
  const spec = { openapi: '3.0.3', info: { title: brand.name + ' Public Tools API', version: '1.0.0', description, contact: { name: brand.name, url: brand.origin } }, servers: [{ url: brand.origin }], security: [], externalDocs: { description: 'Usage and limits', url: 'https://github.com/Lucernel/public-apis/blob/main/docs/' + id + '.md' }, paths };
  await writeFile(new URL(`../openapi/${id}.json`, import.meta.url), JSON.stringify(spec, null, 2) + '\n');
  await writeFile(new URL(`../postman/${id}.postman_collection.json`, import.meta.url), JSON.stringify({ info: { name: brand.name + ' Public Tools', description, schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' }, item: items }, null, 2) + '\n');
}
