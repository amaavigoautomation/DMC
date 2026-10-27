# DMC24 SEO deployment guide

Current production origin: https://dmc24-platform.puratech-7527.chatgpt.site
Planned preferred origin: https://dmc24.in

Keep SEO_SITE_CONFIG.json canonical_origin at the current working domain until the new host and HTTPS are ready. launch_origin records the intended domain but does not activate it.

At launch:
1. Set canonical_origin to https://dmc24.in (no path or trailing slash).
2. Run npm run build, then node scripts/test-seo.mjs. The build regenerates canonical URLs, JSON-LD and breadcrumbs. The server uses the same config for sitemap, robots and dynamic country-brochure links/QR codes.
3. Configure HTTPS and permanent www-to-apex redirects on the chosen host. Preserve existing page paths. The canonical paths are extensionless. Public .html and trailing-slash aliases permanently redirect (301), and /uae redirects to /dubai; query parameters are retained.
4. Keep admin routes and APIs authenticated. Make marketing pages publicly accessible in hosting settings; application code does not override Sites access controls.
5. GET /sitemap.xml and /robots.txt anonymously. Sitemap is generated from public pages and current destination visibility; future pages join automatically unless private, preview, review or noindex.
6. Regenerate pre-designed static PDF brochures separately if their embedded links still point to the former host. Validate PDF links before distribution.
7. Verify dmc24.in in Search Console and Bing Webmaster Tools; submit /sitemap.xml. Check URL Inspection and mobile performance on the final host.

Validation: test-seo checks initial HTML for unique public titles, one H1, canonicals, parseable JSON-LD, breadcrumb presence, local page links, and hiding disabled countries from sitemap. External rich-result validation and browser/mobile performance checks are separate launch checks.

Four JavaScript-authored pages are pre-rendered during build, preserving existing templates and interactions. Keep these templates as their source of truth.

Source downloads alone do not export the live destination visibility database. Migrate data separately so the new site's sitemap matches published visibility.

## SEO management for administrators
Open /admin and choose SEO Management (or /seo-management). The module lists public marketing pages automatically and shows hidden destinations. Admin and preview pages are excluded and remain non-indexable.

Select a page, edit its title/description, optional visible H1 and breadcrumb label, editorial keyword, canonical choice, index/follow flags, sitemap preference and social-sharing fields. Blank optional fields retain their source defaults or documented title/description fallback. Character targets are guidance; server hard limits prevent excessive values. The keyword is an internal editorial aid, not a meta-keywords tag.

Save draft does not change public pages. Publish saved draft applies the last saved revision immediately to server HTML and sitemap. Unsaved changes must be saved first. Reload obtains current saved settings; Load original defaults changes only the editor until saved and published. Concurrent edits return a conflict instead of silently overwriting another session.

Search/social previews are illustrative. Noindex and hidden destinations are excluded from the sitemap; canonicalised copies are also excluded. Canonical selection does not redirect or rename a page. Structured data stays generated and receives matching title, description, article heading and breadcrumb changes. Image URL fields do not upload images.

Export/import the page_seo table together with the other production tables when changing host. Canonical choices are stored as relative page paths so the origin follows SEO_SITE_CONFIG.json. Prefer root-relative /img/... paths for site-owned social images. Public hosting access, Search Console setup and actual search-engine recrawling remain separate launch steps.
