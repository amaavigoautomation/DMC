# Validation record

Prepared 21 October 2026 (IST). Source: v171, commit `ad61ef79dc0f8d924902eb9a882cc446d8bcbab1`.

## Passed during preparation

- Converted build completed: 95 flat HTML page files, 24 destination models.
- One physical CSS file remains; all built HTML pages link to that stylesheet.
- Nine local automated tests: MySQL result-contract/duplicate handling; rollback on batch errors; stale bulk-copy checks before writes; private upload storage; static HTML access restrictions; HTTP identity-header sanitization/internal PDF restriction; page/CSS inventory; removal of SQLite-only SQL constructs; migration security transformations; SQLite export fidelity/checksum validation (some related checks are grouped within the nine tests).
- Offline SQLite export test preserved Unicode, quotes, NULL values and JSON; tampered export checksum was rejected.
- Source JavaScript syntax checks and archive integrity checks are recorded in the included preparation report.

These use controlled test doubles for the database adapter. They do not prove real MySQL driver/server behavior.

## Not performed here — required before deployment

- Real MySQL 8.4 integration test execution: no MySQL server or Docker runtime was available in this execution environment.
- Live database export/import and uploaded R2 image transfer. The archive contains source assets and conversion tools, not a current production data backup.
- Desktop/mobile visual browser regression.
- Microsoft 365 credential configuration, authorized test send and delivery verification.
- Production TLS, Nginx, systemd, DNS, GeoIP integration, load and concurrency tests, backup restore drill.

Run `npm run test:mysql` against a new disposable `_test` database after applying the schema. Complete the acceptance checklist in the developer guide. The supplied integration suite is pending execution and may reveal host/version-specific adjustments; do not call the package production-validated until it passes.

No live website deployment, live database mutation or real email send was performed while preparing this handover.
