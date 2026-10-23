# API behavior, limits, and privacy

**Live as of October 23, 2026.** All five public operations across four sites are deployed. Their responses were checked against the documented contracts on that date.

## Request and response format

- Use HTTPS. No API key or account is required.
- Successful JSON responses use a top-level string field version with value "1" and route-specific fields. Error JSON uses an error object instead.
- POST routes accept Content-Type: application/json and a body of at most 2,048 bytes. Compressed request bodies are not accepted.
- Dates use the real calendar date format YYYY-MM-DD; invalid calendar rollovers are rejected.
- POST routes accept only their documented fields. Unknown fields and query parameters are rejected.
- URLs longer than 1,024 characters are rejected with HTTP 414.
- Successful responses are not guaranteed to remain available or retain the same content. Treat the method identifier and API version as part of the result.

## Errors

Errors use this shape:

    {
      "error": {
        "code": "invalid_date",
        "message": "Use a valid date in YYYY-MM-DD format."
      }
    }

The message is suitable for display; clients should branch on the HTTP status and stable code, not parse the message.

| HTTP status | Meaning |
| --- | --- |
| 400 | Invalid JSON, date, or unsupported parameter |
| 405 | Wrong HTTP method; check the Allow header |
| 408 | Request body was too slow |
| 413 | Request body exceeds 2,048 bytes |
| 414 | URL exceeds 1,024 characters |
| 415 | Unsupported content type or content encoding |
| 429 | Per-client or per-origin rate limit reached |
| 503 | The service is busy or cannot verify the client connection |
| 500 | Unexpected server error |

HTTP 429 and 503 responses may include Retry-After in seconds. Honor that value. Do not retry sooner, rotate IP addresses, create accounts, or otherwise evade a quota. Use bounded retries with backoff for transient errors.

## Rate limits and capacity

Each site has its own API origin and its own limiter state. Quotas are not pooled across Matrice, Istruzione Messina, Lucernel, and Musael. For Matrice, Lucernel, and Musael, each process/runtime has an in-memory guard:

- Per verified client connection group (one IPv4 address or one IPv6 /64): a burst of 10 requests, refilling at one request every 2 seconds (30 requests per minute).
- Per site runtime: a burst of 20 requests, refilling at 10 requests per second.
- At most 8 in-flight requests and 2,048 remembered client entries per runtime.

IMES uses the same client and service rate thresholds, with a durable file-backed limiter shared by its PHP workers. Its concurrency and client-entry ceilings are also 8 in-flight requests and 2,048 remembered clients; a lease expires after 5 seconds. Do not assume its persistence model is the same as the JavaScript services. IPv6 client addresses are grouped by /64. The JavaScript service counters are process-local and reset with a process restart; independent runtime instances can have independent counters. Do not treat quotas as a service-level entitlement or attempt to bypass them.

## Privacy

Submit only the fields needed for the requested calculation. Do not send names, email addresses, account identifiers, or other extra fields. POST date bodies are processed transiently and are not logged by the endpoint. Lucernel's optional date is a query parameter; use it only for a calendar date, never for a personal date of birth. Rate limiting uses a trusted socket/proxy-derived client address, not a caller-controlled forwarding header.

Use a local CLI with JSON from standard input for personal dates when available. Avoid placing birth dates in URLs, shell history, logs, support tickets, analytics, or generated examples. Do not repeat a personal date in an assistant response unless it is necessary.

## Operational scope

These endpoints perform small computations or read existing public data. They do not use AI calls or an application database. They are not an interface to accounts, purchases, premium readings, PDFs, or private manuscripts.

## Free use and retry policy

All four sites' APIs are free public tools, with no login, API key, subscription, or paid tier. They have no availability or throughput guarantee. Retry a transient 429 or 503 only after the returned Retry-After interval, with a bounded attempt count and backoff. The CLI and MCP server do not retry automatically. Do not automatically retry 400, 405, 408, 413, 414, or 415. Do not evade limits by changing IP addresses, proxies, or accounts.
