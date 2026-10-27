# DMC24 Email Automation

Admin route: `/email-automation`. Protected by the existing admin session; API routes are under `/api/admin/email/` with same-origin JSON POST checks. No additional public navigation item is added.

## Activation

The feature ships disabled. All settings and templates can be reviewed immediately. No real email was sent during implementation; the provider was mocked in tests.

1. A Microsoft 365 administrator registers a single-tenant Entra application and authorises app-only Microsoft Graph mail sending for the intended business mailbox. Follow Microsoft’s current Exchange Online application RBAC guidance to restrict sending to this mailbox. Scoped RBAC and unscoped Entra grants are additive: do not retain a broad grant that defeats the intended scope.
2. In Email Automation, enter tenant ID, application ID, sender mailbox, display name, reply-to and client secret **value**, not mailbox password. Credentials stay on the server; the secret is AES-GCM encrypted in D1 using the `EMAIL_ENCRYPTION_KEY` runtime secret. Save the settings.
3. Send a test to an address controlled by the business. A Microsoft HTTP 202 marks the connection as tested, not the inbox as delivered. Check the actual inbox/junk folder or Message Trace.
4. Review response templates, product benefits, destination benefits and the preview. Enable automatic sending and save. Each response type can be independently disabled.
5. Rotate the client secret before expiry. Changing connection settings invalidates the prior test; disable, save the new settings, test and re-enable.

Official references:
- https://learn.microsoft.com/en-us/graph/auth-v2-service
- https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0
- https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac

## Behaviour

- New demo/enquiry records trigger one acknowledgement. A captured destination selects the country template; general contact requests select the enquiry template; other demo requests select the demo template.
- Brochure requests select the brochure template and include a signed seven-day download link. Brochure links are subject to destination visibility and existing Sites access controls. Expired links require a new request.
- Brochure acknowledgement deduplication is per normalised email, brochure and UTC calendar day. Demo acknowledgements are deduplicated by request ID. Existing historical enquiries are not replayed.
- Names, companies and other visitor fields are escaped in HTML. Subject line newlines are removed. No arbitrary template HTML or external CTA path is accepted.
- Country benefits default to feature points derived from current country pages at build time. Admin overrides survive future builds. New registered destinations appear automatically; benefit points may vary by edition.
- Enquiry submission remains successful even if email enqueue/delivery fails. Provider work runs in the Worker execution context when available. A database outbox persists content/status before sending.
- Sending uses the Microsoft Graph v1.0 `/users/{sender}/sendMail` endpoint and application client-credentials tokens. Sent Items is enabled.
- Statuses: disabled, queued, sending, accepted, failed, unknown. Accepted means handed to Microsoft, not delivery/open tracking. This release does not ingest Microsoft bounce notifications or Message Trace.
- Failed/queued messages can be manually retried from Email History with one-minute cooldown, five-attempt limit and seven-day age limit. No periodic background retry scheduler is installed. Each new request dispatches its own message automatically.
- A timeout/server error after sending begins is held as unknown. Interrupted sending rows are marked unknown after five minutes when history loads. Check Sent Items/Message Trace; unknown messages cannot be retried from this UI to avoid duplicates.
- Requests received while off are logged as disabled and are never auto-replayed. Test messages are rate-limited to ten per hour.

## Hosting and export

Migration `0010_far_hex.sql` creates `email_settings` and `email_outbox`; retain schema migrations and D1 records during export. Keep the encrypted secret ciphertext and `EMAIL_ENCRYPTION_KEY` together securely when migrating, or re-enter the client secret on the new server. Never include the runtime encryption key in source or project ZIPs. Losing or rotating the encryption key requires re-entering the Microsoft secret and a fresh connection test. Rebuild after changing the canonical domain so email URLs point to the launch site.

## Validation

`node scripts/test-email-automation.mjs` exercises authorisation, CSRF, encryption, revisions, preview escaping, enable/test gating, mocked Microsoft send, duplicates, signed brochure URLs, unknown outcomes, manual retry and admin UI. Existing `test-demo-requests.mjs` and `test-brochure-gate.mjs` cover form regressions. Visual browser QA and real Microsoft delivery require the configured mailbox.
