# CSS consolidation verification — 28 September 2026

The refactor removes route-scoped CSS while preserving the approved site.

- Reviewed all 49 HTML pages and the HTML produced by the shared JavaScript modules.
- Compared every page with the previous committed version at 390px, 800px, 1100px and 1365px viewport widths (196 before/after page comparisons).
- Rendered content, element counts, element geometry, and the checked computed typography, spacing, colour, borders, shadows, layout and visibility values match. Local image URL prefixes were normalized because the baseline and working copy live in different folders. Chrome's differing serialization of automatic horizontal margins was ignored only when the element geometry was identical.
- Confirmed no JavaScript console exceptions in the tablet comparison runs; desktop/mobile captures were also checked for errors.
- Checked mobile menus in both shell variants, the desktop Product menu, destination filtering, and monthly/yearly pricing round trips in all five priced country pages.
- Confirmed setup fees: Sri Lanka, Hong Kong, Singapore and Malaysia — BIZ none, PRO USD 1,200, PRO PLUS USD 2,000, ENT USD 3,000. Maldives — Business none, Professional USD 1,500, Enterprise USD 2,000.
- One authored CSS file and one authored JavaScript file remain. CSS contains no `data-page` selectors, no generated `html:is(...)` page scopes, and no exact duplicate rules.
- Existing content, local image files and remote image references are unchanged. Remote HTTPS requests were blocked consistently during baseline comparisons to avoid external loading variability; these checks do not certify remote image availability.

The comparison used Chromium 134 through Playwright. The checks establish equivalence at the tested sizes; they are not an SEO audit or a claim of exhaustive cross-browser certification.
