import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { requestTool } from '../client/index.mjs';
import { contracts, NAME_KINDS } from '../client/contracts.mjs';

export function createServer({ request = requestTool } = {}) {
  const server = new McpServer({ name: 'lucernel-public-tools', version: '0.1.1' });
  const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Calendar date YYYY-MM-DD. Send personal birth dates only when the user requests this calculation.');
  const schemas = {
    matrix: { date }, couple: { first_date: date, second_date: date }, 'angel-number': { date },
    verse: { date: date.optional() },
    names: { kind: z.enum(NAME_KINDS).optional(), seed: z.number().int().min(1).max(999999).optional(), count: z.number().int().min(1).max(20).optional() },
  };
  for (const contract of contracts) {
    server.registerTool(contract.tool.replaceAll('-', '_'), {
      title: contract.title, description: contract.summary + ' Calls the official public API. Honor rate limits; no accounts, premium readings or manuscripts are accessible.',
      inputSchema: z.object(schemas[contract.tool]).strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async input => {
      try {
        const result = await request(contract.tool, input);
        return { content: [{ type: 'text', text: JSON.stringify(result) }], structuredContent: result };
      } catch (error) {
        const result = { error: { code: error.code ?? 'request_failed', message: error.status === 429 ? 'Rate limit reached. Wait before a later attempt.' : 'The public API request could not be completed.', ...(error.retryAfter ? { retryAfter: error.retryAfter } : {}) } };
        return { isError: true, content: [{ type: 'text', text: JSON.stringify(result) }] };
      }
    });
  }
  return server;
}
