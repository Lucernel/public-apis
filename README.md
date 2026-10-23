# Lucernel Public Tools

**Live API operations, verified October 23, 2026.** Five public operations across four sites are deployed and available. Use the `@lucernel/public-tools` package or this source checkout for the CLI and optional MCP server.

This repository documents small, unauthenticated JSON tools from four independent sites:

| Site | Tool | Details |
| --- | --- | --- |
| [Matrice del Destino](https://matricedeldestino.it) | Personal and couple matrix calculations | [Matrice API](docs/matrice.md) |
| [Istruzione Messina](https://istruzionemessina.it) | Date-based angel number | [IMES API](docs/imes.md) |
| [Lucernel](https://lucernel.com) | Daily World English Bible verse | [Lucernel API](docs/lucernel.md) |
| [Musael](https://musael.com) | Seeded name generation | [Musael API](docs/musael.md) |

Read [API behavior, errors, limits, and privacy](docs/api.md) before integrating. Each site has its own origin and quota, with site-specific limiter state. The local CLI is covered in [CLI usage](docs/cli.md). Optional local stdio integration is documented in [MCP server setup](docs/mcp.md).

The `lucernel-tools` CLI requires Node.js 22 or later. Run `bunx --package @lucernel/public-tools@0.1.1 lucernel-tools --help`, or follow the source instructions below.

These tools use existing site calculations or data. They do not require authentication, call AI services, or access application databases. Matrice premium readings and PDFs, private account data, and Musael manuscripts are outside this API.

## API specifications and Postman collections

The files below describe the live route contracts. Production responses were checked against all five tool contracts on October 23, 2026.

Public documentation: [Matrice](https://documenter.getpostman.com/view/59169256/2sBYHUTLJs) · [Istruzione Messina](https://documenter.getpostman.com/view/59169256/2sBYHUTLJt) · [Lucernel](https://documenter.getpostman.com/view/59169256/2sBYHUTLP9) · [Musael](https://documenter.getpostman.com/view/59169256/2sBYHUTLPA).

- Matrice: [OpenAPI](openapi/matrice.json) · [Postman collection](postman/matrice.postman_collection.json)
- Istruzione Messina: [OpenAPI](openapi/imes.json) · [Postman collection](postman/imes.postman_collection.json)
- Lucernel: [OpenAPI](openapi/lucernel.json) · [Postman collection](postman/lucernel.postman_collection.json)
- Musael: [OpenAPI](openapi/musael.json) · [Postman collection](postman/musael.postman_collection.json)

The direct API endpoints are free to use, with no login, key, subscription, or paid tier. Apply bounded retries only: honor Retry-After for 429/503, do not retry validation errors, and never change networks or accounts to evade a quota.

See [distribution status](docs/distribution.md) for the public package, MCP Registry entry, marketplace links, and checks still pending. Third-party gateways have their own account requirements and quotas.

## License

The toolkit is MIT. Author-written `SKILL.md` files and their `references/` text are MIT-0 when distributed through ClawHub; other toolkit files remain MIT.
