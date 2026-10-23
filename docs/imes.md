# Istruzione Messina API

**Preview:** The IMES API route is implemented in a release candidate but is not deployed. Do not call it until deployment is announced.

## Date-based angel number

    POST https://istruzionemessina.it/api/public/v1/angel-number.php
    Content-Type: application/json

Request body:

    {
      "date": "1990-06-15"
    }

date is required and must be a valid date from 1900 through today in UTC. The endpoint rejects unknown body fields and URL query parameters.

The response includes:

- version: "1"
- method: "digit-root-date-v1"
- number: an integer from 1 through 9
- source: https://istruzionemessina.it/numeri-angelici-guida-completa/

This endpoint returns the date's digit-root result. It does not provide a personalized reading.

See [shared request, rate-limit, and privacy rules](api.md). Do not put a real birth date in a URL or evade 429/503 responses by switching networks.

The route is described in the [OpenAPI spec](../openapi/imes.json) and [Postman collection](../postman/imes.postman_collection.json).
