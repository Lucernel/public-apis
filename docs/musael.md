# Musael API

**Live as of October 23, 2026.** The Musael API route is deployed and the public OpenAPI document returned HTTP 200.

## Seeded names

    GET https://musael.com/api/public/v1/names

Optional query parameters:

| Name | Default | Allowed values |
| --- | --- | --- |
| kind | fantasy | One of the name-generator kinds listed below |
| seed | 1 | Integer from 1 through 999999 |
| count | 10 | Integer from 1 through 20 |

Available kinds:

    fantasy, fantasy-last, elf, dwarf, dragon, kingdom, town, village,
    tavern, wizard, orc, city, guild, ship, sword, spell, god, demon,
    vampire, pirate, knight, sci-fi-planet, alien, starship

The response includes:

- version: "1"
- kind: selected generator kind
- seed: selected integer seed
- names: generated names
- source: the selected generator page, https://musael.com/tools/{kind}-name-generator

Generation uses the existing deterministic name generators and a seed. Results may change if a future release changes generator data or behavior. This endpoint does not use AI and does not access private manuscripts or projects.

See [shared request, rate-limit, and privacy rules](api.md). Honor Retry-After and do not evade 429/503 responses by switching networks.

The route is described in the [OpenAPI spec](../openapi/musael.json) and [Postman collection](../postman/musael.postman_collection.json).
