# Demo requests

The shared form appears at `/request-demo` and in the demo section of `/contact`. The global `shared-demo` module routes demo calls to action to `/request-demo`, adding the source page, destination slug and plan variant. It discovers current and dynamically added `.sl-plan`/`.price-card` plan buttons. New pages should use the shared components or explicit `/request-demo?variant=Enterprise&destination=kenya&source=/kenya` links.

The form offers all 249 ISO countries, multiple operating countries, solutions, team size and implementation timing. Selected destination/variant is visible above the form; general requests leave these unspecified. These context fields are visitor-supplied sales context, not authenticated commercial selections. There are no pricing commitments or email notifications.

Requests are server-validated and stored in the existing D1 DB in `demo_requests` (migration 0007). Contact consent and submission timestamps are recorded in UTC, displayed/exported in IST. Retry uses a per-form UUID to prevent duplicate submissions. A honeypot and email-based five-per-hour limit provide basic abuse protection. Preserve this table in database backups and external-host migration.

`/demo-requests` is registered in `server/admin-registry.json`; it uses the existing admin login. `/api/admin/demo-requests` and its `/status` route require the server session. The dashboard supports paginated search, destination/variant/status filters, sorting, filtered CSV export, expandable qualification details, and revision-checked status updates. No record deletion is exposed.

Run `node scripts/test-demo-requests.mjs` after changes. Tests use an isolated SQLite database, check every destination's plan buttons and both shared form locations, and never create live sales leads.
