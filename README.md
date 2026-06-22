# Nida Mock API

A mock REST API that simulates Tanzania's NIDA (National Identification Authority) citizen lookup service. Built with Express, TypeScript, and sql.js (SQLite WASM).

## Quick Start

```bash
npm install
npx tsx src/index.ts
```

Server starts on `http://localhost:8000` with 100 seeded citizen records.

```bash
npx vitest run    # run 16 automated tests
```

## Endpoints

| Method | Path                 | Description                          |
|--------|----------------------|--------------------------------------|
| GET    | `/v1/citizens`       | List citizens (filter, sort, paginate) |
| GET    | `/v1/citizens/:nin`  | Get single citizen by 20-digit NIN   |
| POST   | `/v1/citizens`       | Create a new citizen                 |
| PUT    | `/v1/citizens/:nin`  | Upsert — create or replace           |
| DELETE | `/v1/citizens/:nin`  | Delete a citizen (idempotent, 204)   |
| GET    | `/`                  | Service info                         |

## Examples

```bash
# List — filter by region, sort by surname descending, pick fields
curl "http://localhost:8000/v1/citizens?region=Dar+es+Salaam&sort=-surname&fields=nin,firstname,surname&limit=3"

# Get by NIN
curl "http://localhost:8000/v1/citizens/19800101123456789012"

# Create
curl -X POST http://localhost:8000/v1/citizens \
  -H 'Content-Type: application/json' \
  -d '{"FIRSTNAME":"Juma","SURNAME":"Mwamba","SEX":"MALE"}'

# Delete
curl -s -o /dev/null -w "%{http_code}" -X DELETE http://localhost:8000/v1/citizens/19800101123456789012
```

## Query Parameters (GET /v1/citizens)

| Param    | Example                  | Description                        |
|----------|--------------------------|------------------------------------|
| `region` | `Dar+es+Salaam`          | Filter by resident region          |
| `district`| `Ilala`                 | Filter by resident district        |
| `ward`   | `Kariakoo`               | Filter by resident ward            |
| `sex`    | `MALE`                   | Filter by sex                      |
| `sort`   | `+surname` or `-surname` | Sort ascending (+) or descending (-)|
| `limit`  | `10`                     | Results per page (max 100, default 20) |
| `start`  | `20`                     | Offset for pagination              |
| `fields` | `nin,firstname,surname`  | Comma-separated field selection    |

## Response Formats

**List:** `{ "data": [ Citizen... ], "pagination": { "total", "limit", "start", "next" } }`

**Single:** `{ "obj": { "result": Citizen } }` or `{ "obj": { "error": "National ID not found in registry" } }`

**Validation error:** `{ "obj": { "error": "Validation failed", "code": "VALIDATION_ERROR", "details": [...] } }`

**Rate limited (429):** `{ "error": "Too many requests...", "code": "RATE_LIMITED" }`

## Citizen Fields

33 fields — see [data_types.txt](data_types.txt) for full schema. Key fields:

- `NIN` — 20-digit national ID (`YYYYMMDD` + 12-digit serial)
- `FIRSTNAME`, `MIDDLENAME`, `SURNAME`, `LASTNAME` — name fields
- `SEX` — `MALE` or `FEMALE` (CHECK constraint)
- `DATEOFBIRTH` — `YYYY-MM-DD`
- `PHOTO`, `SIGNATURE` — base64-encoded 1x1 pixel PNG placeholders
- Residence/permanent location fields (region, district, ward, village, street, postcode)

## Project Structure

```
├── src/
│   ├── config.ts          — PORT, rate limits, field whitelists
│   ├── types.ts           — Citizen, NidaResponse, QueryParams, AppError
│   ├── app.ts             — Express app assembly (CORS, JSON, routes)
│   ├── index.ts           — Entry point: init DB → schema → seed → listen
│   ├── env.d.ts           — sql.js type declaration
│   ├── data/
│   │   ├── citizens.ts    — 100 deterministic records
│   │   └── placeholders.ts — 1x1 PNG base64 for PHOTO/SIGNATURE
│   ├── db/
│   │   ├── index.ts       — sql.js singleton (getDb, saveDatabase, closeDatabase)
│   │   ├── schema.ts      — CREATE TABLE with CHECK constraints
│   │   └── seed.ts        — Transaction-based bulk insert
│   ├── middleware/
│   │   ├── errorHandler.ts — Structured error responses
│   │   └── rateLimiter.ts  — express-rate-limit (100/min global, 10/min POST)
│   ├── routes/
│   │   └── citizens.ts    — All CRUD routes with validation
│   └── utils/
│       └── queryBuilder.ts — Dynamic SQL for filter/sort/paginate/fields
├── tests/
│   └── citizens.test.ts   — 16 tests (vitest + supertest)
├── data_types.txt         — Full schema reference
└── README.md
```

## Notes

- **In-memory only** — seed data persists to `nida.db` to avoid re-seeding on restart, but runtime changes (POST/PUT/DELETE) are not saved. Restart resets modifications.
- **sql.js** — SQLite compiled to WASM. No native dependencies, so it works regardless of spaces in the project path.
- **Rate limits** — 100 req/min global, 10 req/min on POST. Exceeded requests return 429 with a Retry-After header.
- **NIN generation** — POST auto-generates NIN from `YYYYMMDD` + random serial if not provided.
