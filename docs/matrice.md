# Matrice del Destino API

**Live as of October 23, 2026.** Both Matrice API routes are deployed and production smoke checks passed.

Both routes use the existing Matrice del Destino calculations. They return numerical data, not a premium reading or a PDF.

## Personal matrix

    POST https://matricedeldestino.it/api/public/v1/matrix
    Content-Type: application/json

Request body:

    {
      "date": "1990-06-15"
    }

date is required and must be a valid date from 1900 through today in UTC. The endpoint rejects unknown body fields and URL query parameters.

The OpenAPI schema lists the complete response fields:

- version: "1"
- method: "matrice-22-v1"
- points: an object with optional numeric keys A, B, C, D, E, F, G, I, H, F1, F2, G1, G2, I1, I2, H1, H2, M, L, R, R2, R1, Q, N, J, K, O, P, L2, L1, S, and T
- purposes: an object with numeric keys skypoint, earthpoint, perspurpose, femalepoint, malepoint, socialpurpose, generalpurpose, and planetarypurpose
- source: https://matricedeldestino.it/calcolo-a-mano

An exhaustive validation across all 46,317 valid dates from 1900-01-01 through 2026-10-23 confirmed all 32 point keys and all 8 purpose keys are returned. Every value is an integer from 1 through 22; no keys are omitted and no values are null. The runtime mapper's generic `Partial` type is broader than the observed runtime response and does not indicate a schema mismatch.

## Couple matrix

    POST https://matricedeldestino.it/api/public/v1/couple
    Content-Type: application/json

Request body:

    {
      "first_date": "1990-06-15",
      "second_date": "1986-09-27"
    }

Both dates are required and must be valid dates from 1900 through today in UTC. The endpoint rejects unknown body fields and URL query parameters.

The OpenAPI schema lists the complete response fields:

- version: "1"
- method: "matrice-couple-22-v1"
- couple: a book-points object
- first: a book-points object for the first date
- second: a book-points object for the second date
- source: https://matricedeldestino.it/matrice-coppia

See [shared request, rate-limit, and privacy rules](api.md). Do not evade 429 or 503 responses by switching networks.

Both live route operations are described in the [OpenAPI spec](../openapi/matrice.json) and [Postman collection](../postman/matrice.postman_collection.json).
