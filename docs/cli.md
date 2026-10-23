# CLI usage

The CLI is available as `@lucernel/public-tools` and from this source repository. All five API operations across four sites are live; commands that make requests call those APIs unless `--dry-run` is supplied.

The CLI requires Node.js 22 or later. Run its local entry point from the repository root:

    node bin/lucernel-tools.mjs --help

Commands:

| Command | Purpose | Main options |
| --- | --- | --- |
| matrix | Calculate a personal matrix | --date or --stdin-json |
| couple | Calculate a couple matrix | --first-date, --second-date, or --stdin-json |
| angel-number | Calculate an angel number from a date | --date or --stdin-json |
| verse | Get the daily verse | optional --date |
| names | Generate seeded names | --kind, --seed, --count |

Available flags include --json, --plain, --dry-run (also -n), --stdin-json, --help (also -h), and --version. Help output lists exact syntax. The CLI does not require a login or API key and does not automatically retry requests.

For a no-network example, pipe a fixture JSON object to standard input:

    printf '%s' '{"date":"1990-06-15"}' | node bin/lucernel-tools.mjs matrix --stdin-json --dry-run

The dry-run output describes the request without contacting the API. Use only a fixture date in examples. For a real date, provide JSON over standard input from a private prompt or secure input source; do not add the date to command arguments or shell history. Note that dry-run prints the request description, so do not use it with a real birth date if terminal output may be retained.

The --stdin-json option reads one JSON object and accepts up to 2,048 bytes. Do not combine it with field flags. Input fields follow the endpoint contract in the matching [API reference](api.md).

Run the package with an explicit executable name:

    bunx --package @lucernel/public-tools@0.1.0 lucernel-tools --help
    bunx --package @lucernel/public-tools@0.1.0 lucernel-tools matrix --stdin-json

Alternatively, install with `bun add --global @lucernel/public-tools@0.1.0`. Use the installed CLI's `--help` output as the authoritative interface. Never run a network-calling command with a personal birth date in an example or unattended script. The ordinary CLI entry point imports the HTTP client only; it does not import or initialize the optional MCP server or load its MCP SDK and Zod modules.
