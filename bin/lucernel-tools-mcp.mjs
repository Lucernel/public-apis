#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from '../mcp/server.mjs';
await createServer().connect(new StdioServerTransport());
