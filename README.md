# Lucernel Public Tools

**Preview documentation.** The API routes are not yet deployed, and the @lucernel/public-tools package is not published. Do not send requests to these routes until the deployment and package release have been announced.

This repository documents small, unauthenticated JSON tools from four independent sites:

| Site | Tool | Details |
| --- | --- | --- |
| Matrice del Destino | Personal and couple matrix calculations | [Matrice API](docs/matrice.md) |
| Istruzione Messina | Date-based angel number | [IMES API](docs/imes.md) |
| Lucernel | Daily World English Bible verse | [Lucernel API](docs/lucernel.md) |
| Musael | Seeded name generation | [Musael API](docs/musael.md) |

Read [API behavior, errors, limits, and privacy](docs/api.md) before integrating. Each site has its own origin and quota, with site-specific limiter state. The local CLI is covered in [CLI usage](docs/cli.md).

The candidate CLI is lucernel-tools in @lucernel/public-tools version 0.1.0, with Node.js 22 or later. Its implementation is available in this repository; the npm package is not published yet. See [CLI usage](docs/cli.md) for local use and the post-publication installation example.

These tools use existing site calculations or data. They do not require authentication, call AI services, or access application databases. Matrice premium readings and PDFs, private account data, and Musael manuscripts are outside this API.

## API specifications and Postman collections

The files below describe the release candidate; their hosted endpoints must remain marked preview until deployment is confirmed.

- Matrice: [OpenAPI](openapi/matrice.json) · [Postman collection](postman/matrice.postman_collection.json)
- Istruzione Messina: [OpenAPI](openapi/imes.json) · [Postman collection](postman/imes.postman_collection.json)
- Lucernel: [OpenAPI](openapi/lucernel.json) · [Postman collection](postman/lucernel.postman_collection.json)
- Musael: [OpenAPI](openapi/musael.json) · [Postman collection](postman/musael.postman_collection.json)

All four APIs are intended to be free to use, with no login, key, subscription, or paid tier. Apply bounded retries only: honor Retry-After for 429/503, do not retry validation errors, and never change networks or accounts to evade a quota.
