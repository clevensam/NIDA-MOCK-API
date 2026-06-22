# REST API Design Skills

- **rest-api-safety-idempotency** — Full REST API design guide including:

  **Resource Naming** — Nouns not verbs, hyphens not underscores, plural collections, limit nesting to 2-3 levels.
  ```
  // Bad: GET /getCitizens, POST /createOrder, /inventory_management, /deleteUser?id=5
  // Good: GET /citizens, POST /orders, /inventory-management, DELETE /users/5
  // Nesting: /v1/citizens/:nin (flat) not /v1/country/1/region/2/district/3/...
  ```

  **Safety & Idempotency** — GET is safe (no side effects, cacheable) and idempotent (repeatable same result). POST is neither — creates a new resource every call. PUT and DELETE are unsafe but idempotent — same final state on repeat.
  ```
  // POST creates new each time — NOT idempotent
  app.post('/v1/orders', (req, res) => {
    const order = db.orders.create(req.body);
    res.status(201).json(order); // 2nd call → duplicate order, double charge
  });

  // DELETE — state is same after first call (resource gone)
  app.delete('/v1/citizens/:nin', (req, res) => {
    const found = db.citizens.find(req.params.nin);
    db.citizens.delete(req.params.nin);
    // First: 204 (deleted), Second: 204 (already gone) — state identical
    res.status(204).send();
  });

  // PUT — idempotent full replacement
  app.put('/v1/citizens/:nin', (req, res) => {
    db.citizens.upsert({ NIN: req.params.nin, ...req.body });
    res.json(db.citizens.find(req.params.nin)); // same result on repeat
  });
  ```

  **Method Matrix** — Cheat sheet for RESTful standards:
  ```
  GET    — Safe ✓, Idempotent ✓ — Retrieves data, no state change, cacheable
  POST   — Safe ✗, Idempotent ✗ — Creates new resource each call
  PUT    — Safe ✗, Idempotent ✓ — Replaces resource, same result on repeat
  DELETE — Safe ✗, Idempotent ✓ — Removes resource, gone is gone
  ```

  **Error Handling** — Consistent error responses, appropriate status codes, and validation feedback.
  ```
  // Consistent error format
  { "error": "Human-readable message", "code": "VALIDATION_ERROR",
    "details": [{ "field": "email", "message": "Invalid format" }] }

  // Status codes
  400 — Bad request (malformed input)       401 — Missing/invalid auth
  403 — Authenticated but not authorized     404 — Resource not found
  409 — Conflict (duplicate NIN, id/key)     422 — Validation errors (field-level)
  429 — Rate limited (+ Retry-After header)  500 — Unexpected server error
  ```

  ```
  // Global error middleware
  class AppError extends Error {
    constructor(public statusCode: number, public code: string,
                message: string, public details?: any[]) {
      super(message);
    }
  }
  app.use((err, req, res, next) => {
    if (err instanceof AppError)
      return res.status(err.statusCode).json({ error: err.message,
        code: err.code, details: err.details });
    console.error(err);
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  });

  // Validation example
  app.post('/v1/citizens', (req, res) => {
    const errs = [];
    if (!req.body.FIRSTNAME) errs.push({ field: 'FIRSTNAME', message: 'Required' });
    if (req.body.NIN?.length !== 20) errs.push({ field: 'NIN', message: 'Must be 20 digits' });
    if (errs.length)
      return res.status(422).json({ error: 'Validation failed',
        code: 'VALIDATION_ERROR', details: errs });
    // ... create citizen ...
  });
  ```

  **Rate Limiting** — Protect against abuse, ensure fair usage, and maintain stability under load.
  ```
  import rateLimit from 'express-rate-limit';

  // Global: 100 requests/minute per IP
  app.use('/v1/', rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Try again later.', code: 'RATE_LIMITED' },
  }));

  // Strict: 5 attempts per 15 min for auth endpoints
  app.use('/v1/auth', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many auth attempts.', code: 'RATE_LIMITED' },
  }));

  // On limit: 429 Too Many Requests + Retry-After header
  // Client should back off and retry after the specified time
  ```

  Precision at Scale** — Filtering, pagination, sorting, and field selection so clients fetch only what they need.
  ```
  GET /v1/citizens?region=Dar+es+Salaam&limit=10&start=0&sort=+surname&fields=NIN,FIRSTNAME,SURNAME

  // Query param patterns
  • Filtering:  ?region=Dar+es+Salaam&sex=MALE
  • Pagination: ?limit=10&start=0         (offset-based)
                 ?cursor=<token>&limit=10 (cursor-based for high scale)
  • Sorting:    ?sort=+surname&sort=-dateofbirth  (+ asc, - desc)
  • Fields:     ?fields=NIN,FIRSTNAME,SURNAME

  app.get('/v1/citizens', (req, res) => {
    let results = [...CITIZENS];
    // Filter
    if (req.query.region)
      results = results.filter(c => c.RESIDENTREGION === req.query.region);
    // Sort
    if (req.query.sort)
      results.sort(/* parse +/- prefix and field name */);
    // Paginate
    const page = results.slice(start, start + limit);
    // Select fields
    const selected = page.map(c => pick(c, fields));
    res.json({ data: selected, pagination: { total, limit, start } });
  });
  ```

  **Async Workflow** — For long-running operations, return 202 Accepted with a status URL the client polls.
  ```
  // POST /v1/import-csv
  → 202 Accepted
  → Location: /v1/status/abc123
  → { jobId: "abc123", status: "processing" }

  // GET /v1/status/abc123 (client polls)
  → { status: "processing" }
  → { status: "completed" } + 303 See Other → /v1/citizens?import=abc123
  ```

  ```
  app.post('/v1/import-csv', (req, res) => {
    const jobId = crypto.randomUUID();
    jobs.set(jobId, { status: 'processing' });
    processCSV(req.body).then(r => jobs.set(jobId, { status: 'done', r }));
    res.status(202).location(`/v1/status/${jobId}`).json({ jobId, status: 'processing' });
  });
  app.get('/v1/status/:jobId', (req, res) => {
    const job = jobs.get(req.params.jobId);
    if (job.status === 'done')
      return res.status(303).location(`/v1/citizens?import=${req.params.jobId}`).end();
    res.json({ status: job.status });
  });
  ```

  **Byte-Range Requests** — Support partial downloads so interrupted transfers resume, not restart.
  ```
  HEAD /v1/photos/id.jpg → Content-Length, Accept-Ranges: bytes
  GET  /v1/photos/id.jpg → Range: bytes=0-1023 → 206 Partial Content + Content-Range

  app.get('/v1/photos/:id', (req, res) => {
    const file = getFile(req.params.id);
    const range = req.headers.range;
    if (!range) return res.status(200).send(file.data);
    const [start, end] = parseRange(range, file.size);
    res.status(206)
      .set('Content-Range', `bytes ${start}-${end}/${file.size}`)
      .set('Accept-Ranges', 'bytes')
      .send(file.data.slice(start, end + 1));
  });
  ```

  **Versioning** — Protect clients from breaking changes with URI-based versioning and OpenAPI contracts.
  ```
  /v1/citizens → { data: [...], pagination: {...} }
  /v2/citizens → { items: [...], page: 1, total: 50 }  (enhanced format)
  /openapi.json → full OpenAPI spec for contract testing

  const v1 = Router(), v2 = Router();
  app.use('/v1', v1); app.use('/v2', v2);
  v1.get('/citizens', v1Handler);
  v2.get('/citizens', v2Handler);
  ```

  **204 No Content** — Return 204 for successful requests with an empty body (DELETE, batch ops).
  ```
  app.delete('/v1/citizens/:nin', (req, res) => {
    db.citizens.delete(req.params.nin);
    res.status(204).send(); // no body, client knows it worked by status
  });
  ```

  Apply when building or modifying HTTP APIs to ensure they are easy to read, hard to misuse, and concise.

- **prototype-db-strategy** — SQLite setup and query patterns for prototype/mock APIs. Schema design with `better-sqlite3`, dynamic SQL for filtering/sorting/pagination/field selection, bulk seeding with transactions, and LowDB as an alternative. Covers the build of the Nida Mock API's data layer. Apply when persisting mock data beyond in-memory arrays.

- **base64-media-handling** — Store and serve base64-encoded images in REST APIs. TEXT vs BLOB vs file path tradeoffs, zero-transform reads (store in API format, return as-is), generating 1x1 pixel and canvas-based placeholder images, and migration path to file storage. Apply when the API contract requires base64 image fields (PHOTO, SIGNATURE).
