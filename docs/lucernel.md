# Lucernel API

**Preview:** The Lucernel API route is implemented in a release candidate but is not deployed. Do not call it until deployment is announced.

## Daily verse

    GET https://lucernel.com/api/public/v1/daily-verse

Optional query parameter:

| Name | Meaning |
| --- | --- |
| date | Calendar date in YYYY-MM-DD; defaults to the current UTC date |

The date must be valid and between 1900 and 2100 inclusive. A verse is selected from the existing 366-entry daily-verse collection. Dates with the same month and day use the same collection position across years.

The response includes:

- version: "1"
- date: the requested or default UTC date
- reference: Bible reference
- text: verse text
- translation: "World English Bible"
- source: https://lucernel.com/tools/daily-bible-verse

The endpoint reads existing verse data and does not call an external Bible service.

See [shared request, rate-limit, and privacy rules](api.md).

The route is described in the [OpenAPI spec](../openapi/lucernel.json) and [Postman collection](../postman/lucernel.postman_collection.json).
