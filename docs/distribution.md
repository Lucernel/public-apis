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
| Matrice del Destino | [Postman](https://documenter.getpostman.com/view/59169256/2sBYHUTLJs) | [RapidAPI](https://rapidapi.com/Lucernel/api/matrice-del-destino-public-tools) | Personal matrix returned 200; couple operation still needs a valid-body retest |
| Istruzione Messina | [Postman](https://documenter.getpostman.com/view/59169256/2sBYHUTLJt) | [RapidAPI](https://rapidapi.com/Lucernel/api/istruzione-messina-public-tools) | Returned 403 HTML; cause under investigation. Use the verified direct endpoint in the meantime |
| Lucernel | [Postman](https://documenter.getpostman.com/view/59169256/2sBYHUTLP9) | [RapidAPI](https://rapidapi.com/Lucernel/api/lucernel-daily-verse) | Returned 200 |
| Musael | [Postman](https://documenter.getpostman.com/view/59169256/2sBYHUTLPA) | [RapidAPI](https://rapidapi.com/Lucernel/api/musael-name-generators) | Not yet verified through this gateway |

All four Postman pages are public, with verified links to the corresponding official sites. Postman marks those links `nofollow`.

All four RapidAPI listings have a free BASIC plan with a hard cap of 1,000 requests per month and 30 requests per minute; paid tiers are disabled. RapidAPI requires its own account/key. Origin quotas still apply independently: gateway traffic can share an origin connection quota, so the marketplace allowance does not guarantee that throughput at the origin. The direct endpoints and the CLI/MCP do not require a marketplace account.

## Awaiting external checks

Four ClawHub skills were submitted as version 1.0.0: `matrice-public-api`, `imes-public-api`, `lucernel-public-api`, and `musael-public-api`, under Lucernel. All still report `pending.publication`; no installable latest version is visible. A clean scanner result is not publication approval. The source skills remain available in this repository.

Smithery account verification is pending; no listing has been submitted there yet. Existing content connectors in other directories have not been resubmitted as duplicates.

MCP.so was excluded because its submission page requires a $39 payment. No paid listing was purchased. Directory listings do not guarantee indexing, followed links, traffic, or search ranking changes.
