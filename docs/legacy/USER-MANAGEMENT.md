# DMC24 user management

Live module: /user-management. Use the existing Admin login as the protected Super Admin. The website continues to use the existing Cloudflare Worker and D1 database. MySQL migration is not part of this release.

## Add a colleague
1. Open Admin → User Management → Add user.
2. Enter the person's name and email (their login name).
3. Select a preset or assign module actions. No rights are granted by default.
4. Save, copy the one-time password setup link, and share it privately yourself. The website does not send an invitation email.
5. The recipient opens the link, sets a 12–128 character password, then signs in at /admin/login using their email.

Setup links expire after 24 hours and are single-use. The secret is shown only in the save/reset response, held in page memory, and stored as a hash in D1. Issue a new link if it was lost or expired. Reset invalidates the old password and any previous setup link.

Site hosting access is a separate boundary. This site retains its custom audience. A colleague must also be allowed through Sites hosting access; creating an application user does not add them to that audience.

## Rights and account status
- View opens the module and its records. Edit saves drafts or changes records. Publish changes live content, including destination visibility, blog unpublishing and archiving.
- Plans bulk-copy with publication requires Publish.
- Export controls supported export endpoints and download buttons. A person with View can still copy the records they can read.
- Email editors can edit templates, product/country benefits and the signature. Connection credentials, sender settings, activation and test sends remain Super Admin-only. Send permits retrying eligible existing emails.
- New modules default to denied for ordinary users until explicitly added to the permission catalog and assigned.
- User Management and the old review prototypes are Super Admin-only.
- Inactive accounts cannot log in. Every saved account/permission change revokes existing sessions. An email change requires password setup again.
- Users remain identifiable in the audit log; deactivation replaces deletion.

## Technical notes
Migration 0011_user_management.sql adds admin_users, admin_audit and admin_sessions.user_id. Preserve all three tables on export. Existing Admin uses the unchanged ADMIN_CREDENTIAL runtime secret and is not imported as an editable user. No sample review users are migrated.

Passwords use salted PBKDF2-SHA256 consistent with the current Worker runtime. Session cookies are Secure, HttpOnly and SameSite=Strict, bound to the hosting identity. Sessions have an 8-hour absolute and 30-minute idle limit. Account revision checks invalidate sessions after permission, status or reset changes. Password setup tokens are cryptographically random, hash-only at rest, atomically consumed and expire in 24 hours. JSON mutations require same-origin requests.

server/user-access.mjs centralizes default-deny page/API authorization; worker.mjs applies it before handlers. Navigation is server-filtered; UI action hiding is supplementary. Unpublished blog media requires Blogs access. Never replace server checks with browser-only controls.

The activity log records successful account changes, password setup and logins, with IST display. This is not a complete audit of all content mutations.

Validation: scripts/test-user-management.mjs exercises database migrations, credential flow, permission boundaries, setup expiry, stale edits, session revocation and Super Admin continuity. Browser visual QA was unavailable at implementation time.
