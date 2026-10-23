---
name: lucernel-public-api
description: Integrates Lucernel's public daily World English Bible verse endpoint. Use when a task needs today's verse or a verse for a specified calendar date.
---

<objective>
Retrieve the date-selected verse from Lucernel's public daily-verse endpoint and preserve its reference, text, translation, and source. The route is preview-only until an API release is announced.
</objective>

<quick_start>
Read [the endpoint reference](references/lucernel.md). When the route is confirmed live, request today's verse with no query parameter, or use the CLI if it is already available:

    node bin/lucernel-tools.mjs verse
</quick_start>

<process>
1. Confirm the route is released before making a network request. While it is marked preview, explain the contract without calling it.
2. Use the current UTC date by omitting date, or provide one valid YYYY-MM-DD date from 1900 through 2100.
3. Check HTTP status and preserve version, date, reference, text, translation, and source.
4. On 429 or 503, honor Retry-After; use bounded retries only.
5. Attribute the text to the World English Bible and link to the source page when presenting it.
</process>

<privacy_and_scope>
This endpoint returns one daily verse from existing data. It does not accept birth dates or account data and does not call an external Bible service. Do not imply that the selected verse is personalized or generated for an individual.
</privacy_and_scope>

<success_criteria>
- The route is confirmed released and the requested date is valid.
- The response keeps its reference and World English Bible attribution.
- Any transient error respects Retry-After.
</success_criteria>
