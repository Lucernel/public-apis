# Optional MCP stdio server

Five API operations across four sites are live. The optional `lucernel-tools-mcp` executable is available from the `@lucernel/public-tools` package or a local source checkout. It is a local stdio process that calls the same public API operations as the CLI.

## Install from source

Use Node.js 22 or later and install the repository dependencies from its root:

```sh
git clone https://github.com/Lucernel/public-apis.git
cd public-apis
bun install
```

The package pins `@modelcontextprotocol/sdk` 1.32.1 and `zod` 4.6.7. Start the process with an absolute path to `bin/lucernel-tools-mcp.mjs`.

## Client configuration examples

For Codex, add this to `~/.codex/config.toml` and replace the path with the checkout location:

```toml
[mcp_servers.lucernel-public-tools]
command = "node"
args = ["/path/to/public-apis/bin/lucernel-tools-mcp.mjs"]
```

For Claude Code, register the local stdio process:

```sh
claude mcp add --transport stdio --scope user lucernel-public-tools -- node /path/to/public-apis/bin/lucernel-tools-mcp.mjs
```

For JSON-configured clients that use an `mcpServers` object:

```json
{
  "mcpServers": {
    "lucernel-public-tools": {
      "command": "node",
      "args": ["/path/to/public-apis/bin/lucernel-tools-mcp.mjs"]
    }
  }
}
```

For a package-based client configuration use command `npx` and arguments `["--yes", "--package", "@lucernel/public-tools@0.1.1", "lucernel-tools-mcp"]`. With Bun, use `bunx --package @lucernel/public-tools@0.1.1 lucernel-tools-mcp`. Version 0.1.1 also provides a default MCP executable, so `bunx @lucernel/public-tools@0.1.1` starts the same stdio server.

The [Official MCP Registry entry](https://registry.modelcontextprotocol.io/?q=io.github.Lucernel%2Fpublic-tools) is `io.github.Lucernel/public-tools`, version 0.1.1. A registry-installed copy was tested against all five live API operations.

## Tools and limits

| MCP tool | Input | Public operation |
| --- | --- | --- |
| `matrix` | `date` | Personal Matrice calculation |
| `couple` | `first_date`, `second_date` | Matrice couple calculation |
| `angel_number` | `date` | Istruzione Messina date calculation |
| `verse` | Optional `date` | Lucernel World English Bible verse |
| `names` | Optional `kind`, `seed`, `count` | Musael seeded name generation |

The five tools are annotated read-only and accept only their documented fields. They send requests to the corresponding public HTTP endpoints. The server provides no tool to read a local workspace or files, access an account or database, buy products, retrieve premium readings or PDFs, or inspect Musael manuscripts. Date inputs can be personal; send a birth date only when the user requested that calculation.

The MCP server does not retry failed requests. A rate-limit error can include `retryAfter`; honor it before making a later request. The server does not rotate networks or accounts.

The ordinary `lucernel-tools` CLI entry point imports the shared HTTP client and does not import or load the MCP SDK or Zod modules. Those packages are used by the separate `lucernel-tools-mcp` entry point. A source dependency install may still install both packages because they are declared in the package manifest.

The MIT project toolkit and the text of the `SKILL.md` files and their references have separate licenses. If those skill texts are distributed through ClawHub, publish those authored skill files under MIT-0 as required by ClawHub; do not describe the skill texts as MIT merely because the surrounding toolkit uses MIT.
