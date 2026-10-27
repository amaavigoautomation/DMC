# User Management review

Route: `/user-management-review`, protected by the existing admin gate and linked from the admin module registry. This is an interactive design review, not an activated identity or authorisation system.

The page includes fictional sample users, a protected reference to the existing Admin account, account editing, active/invited/inactive status simulation, Sales/Marketing/Commercial/read-only presets, module/action matrix, workspace preview, login/setup explanation and a local activity log.

Review changes are held in sessionStorage for this tab. No passwords are collected, invitations sent, real users created, database schemas changed, or live permissions modified. Defaults deny all module access. Checking an action also checks View; clearing View clears that module’s actions. New registry modules appear with unassigned access in the review. Legacy review-only modules are excluded from the permission matrix.

Live implementation requires a separately approved phase: individual account storage, secure password setup/reset, per-request server permission checks including direct URLs and APIs, session revocation, permission-filtered navigation, real audit records and enforcement for each module action. The preview must not be mistaken for those controls. Keep User Management and email provider credentials Super Admin-only. Preserve existing Sites audience/access rules, which remain a separate hosting boundary.

Validation: `node scripts/test-user-management-review.mjs`. Covers protected route, default-deny controls, action dependencies, presets, sample-user save and duplicate validation, inactive workspace preview, login simulation, search and no live API writes. Browser visual verification was unavailable.
