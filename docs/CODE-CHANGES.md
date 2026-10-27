# MySQL Code Changes

Baseline: DMC24 website v171. Changes exist only in this handover package. `SOURCE-CHANGES.patch` is a readable comparison of changed source files; because the website directory is renamed, treat it as a review aid rather than a blind deployment command.

## Files changed or added

| File / area | Change | Reason / behavior |
|---|---|---|
| `runtime/mysql.mjs` (new) | `mysql2` pool; bound parameter statements; transactional batches; bulk pricing transaction | Replaces the D1 binding while retaining callers' `prepare().bind().first/all/run()` result shapes |
| `runtime/server.mjs` (new) | Node HTTP bridge to `worker.fetch`; bounded request body; private assets; background task tracking; graceful shutdown | Runs the existing backend on a conventional Node server |
| `runtime/storage.mjs` (new) | Private filesystem upload adapter and allowlisted asset delivery | Replaces R2/ASSETS services without exposing admin HTML or raw uploads |
| `server/admin-auth.mjs` | MySQL rate-limit upsert; remove Sites actor binding; use verified local-proxy/client IP | Application login now works independently of the former hosting identity |
| `server/worker.mjs` | Remove hosting-owner header shortcut | Client headers cannot grant owner privileges; admin session controls access |
| `server/destinations.mjs` | Replace SQLite JSON-table bulk upsert with `copyPricing()` | Source/targets are locked and checked; all destination writes commit or roll back together |
| `server/pricing.mjs` | Explicit duplicate-safe insert operation | Preserves revision-zero draft creation and stale-save conflict handling |
| `server/seo-management.mjs` | Duplicate-safe insert | Preserves first-save race handling and published SEO isolation |
| `server/blogs.mjs` | Duplicate-safe inserts and MySQL JSON extraction | Preserves seed markers, revision checks and published image access |
| `server/blog-ordering.mjs` | Duplicate-safe initial insert | Preserves separate draft/published display order |
| `server/demo-requests.mjs` | Duplicate-safe request insert | Preserves request-id deduplication |
| `server/email-automation.mjs` | Quote reserved `trigger` identifier and duplicate-safe outbox/settings inserts | Preserves event deduplication and durable send status |
| `server/analytics.mjs` | MySQL ISO-to-IST date expression, quoted `returning`, bounded delete | Preserves IST daily grouping and retention housekeeping |
| `server/user-management.mjs` | MySQL sorting collation and duplicate-email error code | Preserves alphabetical listing and readable duplicate-account errors |
| `server/brochure-access.mjs` | MySQL destination sorting collation | Preserves requested-date/destination sorting |
| `scripts/build.mjs` (new) | Set/validate domain before rebuilding | Keeps generated SEO and backend origin in agreement |
| `scripts/build-pricing.mjs` | Website path; retain generated content; remove Worker packaging; private PDF output | Same country/default/footer/SEO generation for Node deployment |
| `scripts/minify-assets.cjs` | Keep one readable CSS file; hash its delivery URL | No duplicate `main.min.css`; JS minification retained |
| `scripts/generate-seo-structure.py` | Read/write `website/` | Same canonical, heading, breadcrumb and schema generation |
| `scripts/secure-brochure-assets.mjs` | New website/build output paths | Preserve gated product PDF delivery |
| `database/001_initial.sql` (new) | MySQL DDL for all 17 application tables | Replaces SQLite/Drizzle deployment migrations on the target host |
| `database/schema-manifest.json` (new) | Exact column/type/index map | Drives transfer preflight and validation |
| `scripts/mysql-*.mjs`, `export-sqlite.py`, `data-transfer.mjs` (new) | Migration, import, validation and checksum tooling | Makes data transfer reviewable and repeatable |
| `scripts/import-media.mjs` (new) | Map exported R2 objects to private upload storage | Retains media UUID URLs and MIME metadata |
| `scripts/admin-credential.mjs` (new) | Generate salted credential from stdin | No hardcoded/default admin password in the package |
| `.env.example`, deployment files (new) | Environment, HTTPS proxy, service and disposable test DB examples | Documents hosting configuration |
| `tests/` (new) | Local contract tests and real MySQL integration suite | Clearly separates executed local checks from pending DB acceptance |
| `website/*.html` | Shared stylesheet reference; rebuilt origin metadata | Content/design/menu structure retained |
| `package.json`, lockfile | Add mysql2 and explicit build/start/migration/test commands | Repeatable Node dependency installation |

## Important examples

### Duplicate creation

Before (SQLite):

```js
env.DB.prepare('INSERT INTO country_pricing (...) VALUES (...) ON CONFLICT(slug) DO NOTHING')
```

After:

```js
env.DB.prepareIgnore('INSERT INTO country_pricing (...) VALUES (...)')
```

`prepareIgnore()` uses a normal parameterized MySQL INSERT and catches only `ER_DUP_ENTRY`, returning `meta.changes = 0`. It does not use broad `INSERT IGNORE`, which could suppress invalid data. Other SQL errors propagate. A duplicate across a unique key is treated as an unchanged insert and the existing caller reports a conflict where appropriate.

### Login rate limit

SQLite `ON CONFLICT(bucket) DO UPDATE SET` becomes MySQL `ON DUPLICATE KEY UPDATE`. Parameters remain bound; no visitor input is interpolated into SQL.

### JSON field comparison

```sql
-- Before
json_extract(published,'$.image') = ?
-- After
JSON_UNQUOTE(JSON_EXTRACT(published,'$.image')) = ?
```

JSON_UNQUOTE avoids comparing a quoted JSON string with the image path. Stored JSON remains LONGTEXT so application deserialization remains unchanged.

### Bulk pricing

The SQLite `json_each()`/single-upsert statement is removed. The MySQL implementation opens an InnoDB REPEATABLE READ transaction, locks the source and target keys in stable order with `SELECT ... FOR UPDATE`, checks every expected revision before writing, then inserts/updates each target. Deadlock/lock-timeout conflicts roll back and return the reload/retry message; they do not partially publish destinations.

Target feature availability and per-plan `visible`/`priceVisible` flags are preserved by the existing preparation code before the transaction. The transaction rechecks revisions, so prepared values from a stale read cannot be committed.

### Runtime identity

The former `oai-authenticated-user-*` identity is not trusted by the new HTTP service. The adapter strips client-supplied hosting headers, and the application validates its own cookie/session/user permissions. Imported sessions are deliberately excluded. Proxy IP headers are accepted only when configured and received from loopback.

## Preserved business behavior

Three subscription slots plus four setup-fee slots; Enterprise by consultation; independent setup/subscription discounts in IST; draft/published revisions; additional-user pricing; plan and price visibility; country visibility; bulk-copy target flags; blog ordering and author data; server-rendered metadata; enquiry context; Microsoft Graph event deduplication; module-level permissions.

## Do not change these without a separate migration

Do not change password hashing parameters without retaining compatibility or resetting accounts. Do not replace the email encryption key while expecting existing ciphertext to decrypt. Do not move raw uploads into a publicly served folder. Do not expose `website/*.html` directly. Do not recreate production blog/pricing data from source seed defaults.
