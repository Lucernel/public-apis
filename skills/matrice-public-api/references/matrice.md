# Matrice endpoint reference

**Preview:** Do not call the endpoint until release is announced.

## Personal matrix

- Method and route: POST https://matricedeldestino.it/api/public/v1/matrix
- JSON request: {"date":"YYYY-MM-DD"}
- Date range: 1900 through today in UTC
- Response fields: version "1", method "matrice-22-v1", points, purposes, source
- Source page: https://matricedeldestino.it/calcolo-a-mano

points contains available numeric book-letter values. purposes contains skypoint, earthpoint, perspurpose, femalepoint, malepoint, socialpurpose, generalpurpose, and planetarypurpose; values can be null.

## Couple matrix

- Method and route: POST https://matricedeldestino.it/api/public/v1/couple
- JSON request: {"first_date":"YYYY-MM-DD","second_date":"YYYY-MM-DD"}
- Date range for both: 1900 through today in UTC
- Response fields: version "1", method "matrice-couple-22-v1", couple, first, second, source
- Source page: https://matricedeldestino.it/matrice-coppia

Both routes accept no additional fields or query parameters. Shared body, error, rate-limit, and privacy rules are in [the API docs](../../../docs/api.md).
