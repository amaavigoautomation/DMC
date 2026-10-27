# DMC24 Developer Handover & MySQL Migration Guide

**Prepared:** 21 October 2026 (IST)  
**Baseline:** DMC24 website v171; commit `ad61ef79dc0f8d924902eb9a882cc446d8bcbab1`  
**Target:** Node.js 24 + MySQL 8.4 + Nginx HTTPS, with private disk storage for uploaded blog images  
**Status:** Migration implementation prepared; production acceptance pending. Live website unchanged.

This document describes the DMC24 marketing website and administration console. It does not describe or migrate the separate DMC24 ERP product, ASP.NET/C# application, Angular booking platforms or Microsoft SQL Server product databases.

## 1. Architecture and scope

| Layer | Existing website | Handover implementation |
|---|---|---|
| Public pages | HTML/CSS/vanilla JavaScript | Same frontend and content |
| HTML layout | All pages under `dist/` | All 95 pages directly under `website/` |
| Styling | Source and minified stylesheets | One physical CSS file: `website/css/main.css` |
| Backend | Cloudflare Worker fetch handler | Same application handler, hosted by Node HTTP |
| Database | D1 / SQLite | MySQL 8.4 / InnoDB through `mysql2` |
| Blog image uploads | R2 `blog-media/` objects | Private `UPLOAD_DIR/blog-media/` files and MIME sidecars |
| Product brochures | Source PDFs with protected delivery | Same source PDFs and download gate |
| Destination brochures | Generated PDF per country | Same generated PDF flow |
| Authentication | Application login plus Sites hosting boundary | Application login; external hosting boundary is not replicated |
| Email | Microsoft Graph, encrypted credentials | Same Graph integration; disabled after import until retested |
| Deployment | Sites-managed build and hosting | Nginx + Node service; separate MySQL server/database |

The HTTP adapter calls the existing routing and permission checks. It does not expose a folder of static HTML. The flat HTML requirement describes the editable source layout, not permission to bypass the backend.

The supplied deployment is for one application instance with persistent disk storage. Multiple application servers require shared private file storage (or an S3/R2 adapter), coordinated deployment and appropriate pool sizing. MySQL holds shared sessions and settings.

## 2. Folder structure and editing

All website HTML files sit alongside `website/index.html`. Styles use `website/css/main.css`. Shared JavaScript remains in `website/js/main.js`; the build produces its minified delivery file. Images remain in `website/img/`.

Edit the readable CSS, not a second stylesheet. The build never emits `main.min.css`. Nginx compresses CSS in transit. Cache-busting uses a content hash in the stylesheet URL.

Some destinations and page sections are generated from shared JavaScript templates. Change the applicable shared template as well as authored HTML when necessary; rebuild and compare the result. Blogs managed through the admin console are database records, not ongoing edits to the original seed HTML. Preserve the existing approved text, menus, CSS classes and component structure.

`server/generated.mjs` contains built page data, country defaults and the SEO catalog. It must be rebuilt after HTML, shared JavaScript, stylesheet or domain changes. Do not hand-edit generated files. Rebuilding also regenerates protected product brochure assets and their matching keys; deploy the matching `server/` and `private-assets/` together.

### Shared header and footer

The site header and footer live once, in `partials/header.html` and `partials/footer.html`. Pages that use them contain a marker pair, for example `<!-- partial:header --> ... <!-- /partial:header -->`; the build (`scripts/sync-partials.mjs`, run first by `scripts/build.mjs`) rewrites whatever is between the markers from the partial. To change the menu or footer, edit the partial and rebuild; do not edit the copy inside a page, because the next build overwrites it. `node scripts/sync-partials.mjs --check` reports pages that are out of date, and `npm test` fails if any are. Pages without markers (admin pages, previews, `destinations`, `features`, and the four pages whose header is injected by `js/main.js`) are not touched. The partials folder sits outside `website/` because the website root must contain only page files.

## 3. Runtime prerequisites

Install Node.js 24, npm, Python 3 and MySQL 8.4. Use InnoDB, utf8mb4, strict SQL mode and a UTC database session/server. The adapter explicitly uses REPEATABLE READ for transactional work and disables `FOUND_ROWS` so duplicate/no-op results do not masquerade as successful edits.

Use HTTPS at Nginx. Secure admin and brochure cookies require HTTPS; plain HTTP browser testing will not exercise login correctly. Node binds to loopback by default. Do not expose port 3000 to the internet. `TRUST_LOCAL_PROXY=true` accepts the client IP only from a loopback reverse proxy. Nginx must overwrite `X-Real-IP` and `X-Verified-Country` as shown in the example. It must never forward unverified client geolocation values.

Country analytics needs a trusted geolocation service at the proxy. Without one, the website records `ZZ` (unknown); it does not guess a visitor's country. This is a hosting integration still to configure.

Outbound HTTPS access is required for Microsoft identity and Graph endpoints if email automation is used. Hosting account, DNS, certificates, MySQL service, mailbox licensing and backups are outside the archive.

## 4. Configuration

Copy `.env.example` to a private `.env` for staging, or use `/etc/dmc24/production.env` with systemd. Do not commit it or place it in the served asset directories.

| Variable | Purpose |
|---|---|
| `APP_ORIGIN` | Exact external origin, such as `https://dmc24.in` |
| `HOST`, `PORT` | Node bind address/port; default loopback and 3000 |
| `TRUST_LOCAL_PROXY` | Trust local reverse-proxy client-IP/geolocation headers |
| `DB_HOST`, `DB_PORT`, `DB_NAME` | MySQL connection target |
| `DB_USER`, `DB_PASSWORD` | MySQL account; use separate migration/runtime grants |
| `DB_POOL_SIZE` | Maximum connections per application process |
| `DB_SSL_CA` | CA file for verified TLS to remote MySQL |
| `ADMIN_CREDENTIAL` | Salted Super Admin password hash JSON |
| `EMAIL_ENCRYPTION_KEY` | Existing 64-character lowercase hex key for encrypted email secrets |
| `UPLOAD_DIR` | Persistent private upload location outside the website folder |
| `CONFIRM_EMPTY_IMPORT` | Temporary import acknowledgement; must be `yes` for data import |

`APP_ORIGIN` must match `SEO_SITE_CONFIG.json`. Run `node --env-file=.env scripts/build.mjs` to set the configured origin and regenerate SEO and brochure QR data together. Startup fails if the configured and built origins disagree. Use your staging domain while testing; rebuild for `https://dmc24.in` before launch.

Preserve the existing encryption key securely if carrying over encrypted Microsoft credentials. If that key cannot be transferred, re-enter the Microsoft client secret through the new admin console; the old ciphertext cannot be recovered with a new key. Do not include secrets in developer ZIPs, tickets or logs.

## 5. Super Admin and individual users

No default password is included. Generate a new Super Admin credential by passing a 12–128 character password through stdin to `node scripts/admin-credential.mjs`; store the resulting JSON privately as `ADMIN_CREDENTIAL`. For an interactive shell, use a hidden-input prompt rather than a command-line password. Do not place the password or hash in the HTML or JavaScript bundle.

Username `Admin` remains the Super Admin. Individual users log in with their email address, and keep their migrated permissions and password hashes. Import intentionally excludes active sessions and rate-limit counters, and clears outstanding password setup/reset tokens. Every user must log in again; invited users need fresh setup links.

The former Sites audience allowlist is not the new application's authentication mechanism. The public website will be public on the new host. Admin pages and private APIs remain protected by application login and server-side module rights. If the entire website must remain invitation-only during staging, add a separate reverse-proxy access gate.

Permission checks remain default-deny. Publishing prices, hiding destinations, publishing blogs/SEO, exporting enquiries and changing email connection settings retain their separate restrictions. Never replace these checks with hidden menu items alone.

## 6. Create the target database

Have the DBA create a new empty MySQL database and migration account. Example database creation:

```sql
CREATE DATABASE dmc24 CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
```

Use a securely generated account password; do not reuse example credentials. The migration account needs schema-creation privileges. The runtime account normally needs SELECT, INSERT, UPDATE and DELETE on the application database, not DROP/CREATE privileges.

```sh
npm ci
npm run db:migrate
```

The migration runner applies numbered `database/*.sql` files and records their SHA-256 checksums in `schema_migrations`. It acquires a named lock to prevent simultaneous migration runs. Do not edit an applied migration; add another numbered file.

MySQL DDL is not transactionally rolled back by this runner. If initial schema creation fails midway, use a fresh disposable database or have the DBA resolve the partial schema after reviewing the error. Do not delete a production database to retry.

JSON documents intentionally remain LONGTEXT to preserve current JSON serialization and existing `JSON.parse()` code. IDs and indexed columns use bounded VARCHAR fields; integer epoch milliseconds use BIGINT. UTC ISO timestamps remain strings for fidelity with the source application. See the data dictionary for the exact mapping. No arbitrary new foreign keys have been imposed on legacy data.

## 7. Export current live data

**The archive does not contain a production snapshot.** Obtain an authorized, complete D1/SQLite export from the hosting platform. A source-code download is not a database export. Current Sites source credentials are not Cloudflare account credentials; do not assume Wrangler can access the existing database.

Preferred input is a consistent SQLite backup file, or a complete SQL dump loaded into an offline SQLite database. If the platform only provides paginated table exports, the exporter must preserve every column/value and verify counts; truncated UI previews are not valid migration input. Obtain R2 objects separately. Do not move DNS or start the replacement against seed data.

Pause admin publishing and public form writes for the final export/import window, or implement a deliberate delta-transfer strategy. Exporting changing tables one by one is not a consistent snapshot. Record the exact source export time and keep an untouched encrypted backup.

The supplied exporter takes an offline SQLite backup read-only:

```sh
python3 scripts/export-sqlite.py /secure/source.sqlite /secure/dmc24-export
```

It checks the source columns against the v171 manifest and writes 17 JSONL table files plus counts and SHA-256 checksums. It preserves Unicode, quotes, NULLs, JSON, revisions, draft/published values and source dates. The destination export directory must be new. This export contains personal data and password hashes: transfer it privately, outside the website directory.

If the live site's schema changes after v171, update the manifest, schema and conversion before exporting; do not ignore a schema mismatch.

## 8. Import and validate

Stop the replacement application and use a new empty MySQL target with schema already applied. Do not browse the replacement before importing: public blog requests can initialise source seed blogs, making the database nonempty.

```sh
npm run db:import -- /secure/dmc24-export --check-only
# Set CONFIRM_EMPTY_IMPORT=yes in the private configuration for this operation.
npm run db:import -- /secure/dmc24-export
npm run db:validate -- /secure/dmc24-export
```

The importer validates every file checksum, row count, exact column set, required values, bounded strings and integer types. It refuses a nonempty target. All application-row inserts share one transaction; failure rolls back that import. Very large analytics datasets may require DBA planning for transaction/log capacity. Do not increase limits blindly or skip validation.

The validator checks each imported row by its primary key against the transformed source, not just totals. Intentional transformations are:

- `admin_sessions` and `admin_login_limits` are not imported.
- Admin password setup/reset tokens and expiry fields are cleared; password hashes and permissions remain.
- Email configuration is disabled and its successful-test marker cleared; encrypted client secrets remain encrypted.
- Queued or interrupted outgoing emails become `unknown` and are not replayed.

Pricing, per-plan show/hide flags, setup fees, discounts, user limits, blog state/order, enquiries and SEO are otherwise preserved. Unmodified source exports remain available for rollback. Remove `CONFIRM_EMPTY_IMPORT=yes` after the import.

## 9. Transfer blog image objects

Export R2's `blog-media/` objects to a secure directory retaining their UUID keys. Source-controlled website images and product PDFs are already included, but R2-uploaded images are not.

After database import, run:

```sh
node --env-file=.env scripts/import-media.mjs /secure/r2-export
```

The tool checks every `blog_media` record has a corresponding object, imports bytes and MIME metadata into `UPLOAD_DIR`, and refuses to overwrite different existing content. On a write failure, it can be rerun: matching existing bytes are safe. Confirm both public and unpublished/admin-only images render correctly. Back up both MySQL and the upload directory.

## 10. Microsoft 365

The existing Graph implementation is retained. Tenant/application IDs, sender, templates and country USPs can transfer with `email_settings`. The environment key must match migrated encrypted credentials, or the secret must be re-entered.

Keep sending disabled in staging. Configure the app-only Graph permissions and mailbox scope with the Microsoft 365 administrator. Update domain-specific links, send an explicitly authorized test to an agreed mailbox, then enable automation in the admin console. No real test email was sent while preparing this package.

Graph HTTP 202 means accepted by Microsoft, not delivered. Check Sent Items/Message Trace for interrupted/unknown outcomes; do not automatically resend them. The Node process retains background tasks during graceful shutdown. A crash can still interrupt sending; the durable outbox and existing unknown-status handling remain necessary. No periodic automatic retry worker is added.

## 11. Build, staging and deployment

```sh
node --env-file=.env scripts/build.mjs
npm test
```

Copy `deployment/nginx.conf.example` and `deployment/dmc24.service.example` into the hosting setup with appropriate paths, service user, certificates and origin. Run Node as an unprivileged service account. Give it write access only to the persistent upload area and appropriate logging locations. Keep source PDFs, secrets, database exports and backend files outside public static serving.

All URLs pass through Node. Do not add `try_files $uri` or direct HTML aliases. The application preserves existing clean routes, `.html` redirects, `/uae` to `/dubai`, published SEO, visible destination filtering and breadcrumb behavior. Check PDFs and any imported absolute content links for references to the former preview domain. Existing designed product PDFs are retained unchanged; regenerate their embedded links if they point to the old domain before public launch.

For assets, use gzip/Brotli at the reverse proxy. Do not cache admin/API responses or price-dependent HTML as static pages. Cache shared images/CSS/JS with version-aware rules.

## 12. Required acceptance testing

Run the real database integration suite against a fresh disposable MySQL 8.4 database ending in `_test`, after schema migration:

```sh
# Optional local test service:
docker compose -f deployment/compose.test.yml up -d
# Configure private .env for that test service, DB_NAME=dmc24_test.
npm run db:migrate
# Set CONFIRM_TEST_DATABASE=yes only in the disposable test environment.
npm run test:mysql
```

The suite refuses a populated database and leaves test fixtures for inspection. Remove the disposable container when finished. Never set its credentials on production.

The suite exercises actual MySQL queries for login and permissions, every destination, price publishing/redaction, stale updates, bulk-copy conflict handling, visibility, demo/brochure enquiries, CMS initialization, sitemap, analytics and disabled email logs. It must pass on the selected MySQL server before acceptance. Add concurrency/load tests appropriate to hosting volume.

Manual browser acceptance must cover desktop/mobile menus, all destination plans, Monthly/Yearly controls, sliders, discounts in IST, entire-plan hiding, price-only hiding, bulk copying, author pages, blog ordering/editor/uploads, enquiry submission/downloads, SEO publishing and role-based admin actions. Verify review/admin pages cannot be accessed anonymously by `.html` aliases. Confirm no-JS content and sitemap/canonical origin.

## 13. Cutover and rollback

Before DNS changes: archive the current source release, take a consistent final data/object backup, record database counts, test a restore, complete MySQL/browser acceptance and obtain business sign-off. Keep the old site operational until the replacement is accepted. Update dmc24.in DNS and TLS only during the planned launch.

Retain the original database and uploads unchanged. If acceptance fails before launch, discard only the isolated target and retry from the intact source. After launch, reverting DNS alone can lose enquiries or edits received on the new database. Freeze writes, export and reconcile the post-cutover records, then switch back using the rollback plan approved by the DBA.

Schedule database backups and upload backups together; monitor restore success, disk capacity, certificate expiry, service health, database errors and failed/unknown email outcomes. Define backup retention and access with the business owner.

## 14. Remaining launch work

The developer/DBA must supply the actual hosting environment; obtain/export current live records and uploaded files; run the included real-MySQL tests; import and validate the final snapshot; configure secrets, geo analytics and Microsoft 365; complete browser regression; audit embedded PDF/legacy-domain links; and approve the cutover.

This package does not certify production readiness or claim the current live database has already been converted. See `VALIDATION.md` for the preparation evidence.

## References

- MySQL INSERT / affected rows: https://dev.mysql.com/doc/refman/8.4/en/insert-on-duplicate.html
- Node.js releases: https://github.com/nodejs/Release
- Existing module guides: `docs/legacy/` (historical Cloudflare instructions are superseded by this document for the MySQL package).
