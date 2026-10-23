# Distribution status

Checked October 23, 2026. All five direct API operations are live and have passed contract checks. The installed CLI/MCP package successfully called all five operations. Marketplace publication and gateway verification are tracked separately below.

## Package and registry

- [Source repository](https://github.com/Lucernel/public-apis)
- [Published package: @lucernel/public-tools 0.1.1](https://www.npmjs.com/package/@lucernel/public-tools)
- [Official MCP Registry: io.github.Lucernel/public-tools](https://registry.modelcontextprotocol.io/?q=io.github.Lucernel%2Fpublic-tools), active at version 0.1.1

This aggregate MCP exposes the five public calculations/data tools. It is separate from the sites' existing content or account connectors.

## API directories

| Site | Public documentation | Public marketplace listing | Gateway verification |
| --- | --- | --- | --- |
| Matrice del Destino | [Postman](https://documenter.getpostman.com/view/59169256/2sBYHUTLJs) | [RapidAPI](https://rapidapi.com/Lucernel/api/matrice-del-destino-public-tools) | Personal and couple calculations returned 200 with the expected results |
| Istruzione Messina | [Postman](https://documenter.getpostman.com/view/59169256/2sBYHUTLJt) | Direct API only; marketplace listing withdrawn | Cloudflare requires a browser challenge for gateway requests. Use the verified direct endpoint, CLI, or MCP |
| Lucernel | [Postman](https://documenter.getpostman.com/view/59169256/2sBYHUTLP9) | [RapidAPI](https://rapidapi.com/Lucernel/api/lucernel-daily-verse) | Returned 200 |
| Musael | [Postman](https://documenter.getpostman.com/view/59169256/2sBYHUTLPA) | [RapidAPI](https://rapidapi.com/Lucernel/api/musael-name-generators) | Returned 200 with ten generated names and the correct source URL |

All four Postman pages are public, with verified links to the corresponding official sites. Postman marks those links `nofollow`.

The three public RapidAPI listings have a free BASIC plan with a hard cap of 1,000 requests per month and 30 requests per minute; paid tiers are disabled. RapidAPI requires its own account/key. Origin quotas still apply independently: gateway traffic can share an origin connection quota, so the marketplace allowance does not guarantee that throughput at the origin. The direct endpoints and the CLI/MCP do not require a marketplace account.

IMES's owner chose to preserve Cloudflare Bot Fight Mode and use the direct API. Its RapidAPI listing is private, so new users are not offered a gateway that fails. A narrowly scoped browser-check exception was tested and removed when it did not resolve the challenge; existing security rules were restored and verified. The direct endpoint was then checked again successfully.

## Existing Smithery listings

These content/account connectors were already published on October 16 and were verified publicly accessible on October 23. No duplicate servers were created.

- [Matrice del Destino](https://smithery.ai/servers/hello-ddxh/matrice-del-destino): three public-content tools. Its website-link metadata still needs correction.
- [Istruzione Messina](https://smithery.ai/servers/hello-ddxh/istruzionemessina): three public-content tools and a verified link to the site.
- [Lucernel](https://smithery.ai/servers/hello-ddxh/lucernel): four content/catalog tools and a verified link to the site.
- [Musael](https://smithery.ai/servers/hello-ddxh/musael): fifteen account tools and a verified link to the site. Authentication is required to use its account functions.

Smithery [announces the shutdown of its proxy, accounts, API, CLI, and SDKs on October 31, 2026](https://smithery.ai/future). It says a curated public directory will remain; continued inclusion of these listings is not guaranteed. Use the direct MCP URLs (`https://matricedeldestino.it/mcp`, `https://istruzionemessina.it/mcp`, `https://lucernel.com/mcp`, and `https://app.musael.com/api/mcp`) for those existing connectors, or the npm package for the five new public tools. Do not depend on a `run.tools` or `server.smithery.ai` proxy URL.

## Awaiting external checks

Four ClawHub skills were submitted as version 1.0.0: `matrice-public-api`, `imes-public-api`, `lucernel-public-api`, and `musael-public-api`, under Lucernel. All still report `pending.publication`; no installable latest version is visible. A clean scanner result is not publication approval. The source skills remain available in this repository.

MCP.so was excluded because its submission page requires a $39 payment. No paid listing was purchased. Directory listings do not guarantee indexing, followed links, traffic, or search ranking changes.
