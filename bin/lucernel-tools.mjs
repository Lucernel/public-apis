#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { requestTool, describeRequest, PublicToolsError } from '../client/index.mjs';

const help = `lucernel-tools — small public utilities from Lucernel and its sites

  lucernel-tools matrix --date 1990-06-15 --json
  lucernel-tools couple --first-date 1990-06-15 --second-date 1986-09-27
  lucernel-tools angel-number --stdin-json
  lucernel-tools verse --date 2026-10-23
  lucernel-tools names --kind fantasy --seed 123 --count 10

Commands: matrix, couple, angel-number, verse, names
Options:
  --json             JSON result on stdout
  --plain            Human output without terminal decoration (the default)
  --stdin-json       Read input from stdin (maximum 2 KiB); avoids dates in shell history
  --dry-run, -n      Show the request without contacting a server
  --help, -h         Show this help
  --version          Print the version

No login, API key, telemetry or automatic retry. A 429/503 reports Retry-After.
Dates use YYYY-MM-DD. Names: seed 1..999999; count 1..20.
Documentation: https://github.com/Lucernel/public-apis
`;

async function stdinJson() {
  if (process.stdin.isTTY) throw new Error('Pipe a JSON object into --stdin-json.');
  const chunks = []; let size = 0;
  const timer = setTimeout(() => process.stdin.destroy(new Error('Input timed out.')), 5000);
  try {
    for await (const chunk of process.stdin) {
      size += chunk.length; if (size > 2048) throw new Error('Input exceeds 2048 bytes.'); chunks.push(chunk);
    }
    try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
    catch { throw new Error('stdin must contain a valid JSON object.'); }
  } finally { clearTimeout(timer); }
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--help') || argv.includes('-h') || argv[0] === 'help') { console.log(help); return; }
  if (argv.includes('--version')) { console.log('0.1.0'); return; }
  const { values, positionals } = parseArgs({ args: argv, allowPositionals: true, strict: true, options: {
    date: { type: 'string' }, 'first-date': { type: 'string' }, 'second-date': { type: 'string' },
    kind: { type: 'string' }, seed: { type: 'string' }, count: { type: 'string' },
    json: { type: 'boolean' }, plain: { type: 'boolean' }, 'stdin-json': { type: 'boolean' }, 'dry-run': { type: 'boolean', short: 'n' },
  } });
  if (positionals.length !== 1) throw new Error('Choose exactly one command. Use --help for examples.');
  const tool = positionals[0]; const input = {};
  for (const [flag, key] of [['date', 'date'], ['first-date', 'first_date'], ['second-date', 'second_date'], ['kind', 'kind'], ['seed', 'seed'], ['count', 'count']]) {
    if (values[flag] !== undefined) input[key] = ['seed', 'count'].includes(key) ? (/^[1-9]\d*$/.test(values[flag]) ? Number(values[flag]) : NaN) : values[flag];
  }
  if (values['stdin-json'] && Object.keys(input).length) throw new Error('Use either input flags or --stdin-json, not both.');
  const payload = values['stdin-json'] ? await stdinJson() : input;
  const description = describeRequest(tool, payload);
  if (values['dry-run']) { console.log(JSON.stringify({ dryRun: true, ...description }, null, 2)); return; }
  const controller = new AbortController();
  process.once('SIGINT', () => controller.abort());
  const data = await requestTool(tool, payload, { signal: controller.signal });
  if (values.json) { console.log(JSON.stringify(data)); return; }
  if (tool === 'names') console.log(data.names.join('\n'));
  else if (tool === 'verse') console.log(`${data.reference} — ${data.translation}\n${data.text}`);
  else if (tool === 'angel-number') console.log(`Number: ${data.number}`);
  else console.log(JSON.stringify(data.points ?? { couple: data.couple, first: data.first, second: data.second }, null, 2));
  console.log(`Source: ${data.source}`);
}
main().catch(error => {
  if (error instanceof PublicToolsError) {
    console.error(error.message + (error.retryAfter ? ` Retry after ${error.retryAfter} seconds.` : ''));
    process.exitCode = error.status === 429 ? 3 : error.status === 503 ? 4 : 1;
  } else if (error.name === 'AbortError') { console.error('Request cancelled.'); process.exitCode = 130; }
  else if (error.name === 'TimeoutError' || error instanceof TypeError) { console.error('Could not reach the API. Try again later.'); process.exitCode = 1; }
  else { console.error(error.message); process.exitCode = 2; }
});
