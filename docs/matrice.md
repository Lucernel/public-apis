# Matrice del Destino API

**Preview:** The Matrice API routes are implemented in a release candidate but are not deployed. Do not call them until deployment is announced.

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

Only calculated book points are returned in points; a missing point is omitted. The release-candidate schema requires all purpose keys. The numerical values follow the existing calculator.

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

The release candidate has both route operations in its [OpenAPI spec](../openapi/matrice.json) and [Postman collection](../postman/matrice.postman_collection.json).
