# Shared DMC24 breadcrumbs

Every route has one shared breadcrumb navigation before its main content. Ancestors are real links; the current page uses `aria-current="page"`. An ordered list expresses the trail and decorative separators are supplied by CSS. The navigation wraps on narrow screens and has keyboard focus styling.

`BREADCRUMBS.json` controls names and actual parent routes. Destination pages link through Destinations; Dubai links through UAE. Resource pages link through Resources. Mid Office modules link through Mid Office, while product overview pages link through What is DMC24. Other pages link directly from Home where no actual parent landing page exists.

`python scripts/generate-seo-structure.py` generates both initial-HTML navigation and matching JSON-LD. All 48 inner pages have BreadcrumbList; the homepage has a single Home marker and no artificial breadcrumb list for search results. The shared JavaScript places the static navigation before main after dynamic page shells initialize. Existing hero-specific breadcrumbs have been removed to avoid duplication.

Regenerate minified assets with `scripts/minify-assets.cjs` after changing CSS or JavaScript. Future pages must receive a trail entry before running the SEO generator.

Validation: all 49 routes at 390px and 1365px passed (98 checks): exactly one visible trail, correct ordered labels and current marker, valid local parent links, matching inner-page schema, one H1, no horizontal overflow and no JavaScript errors. External images were blocked during local checks.
