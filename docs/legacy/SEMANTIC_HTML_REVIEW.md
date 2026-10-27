# DMC24 semantic HTML review

Reviewed all 49 rendered HTML routes and shared JavaScript templates on 28 September 2026.

## Changes

- Labeled primary navigation and converted mobile/footer link groups to labeled navigation elements, including dynamically generated shells.
- Made the homepage product-link strip a labeled navigation area.
- Replaced section-introduction containers with `header`, preserving their component classes.
- Used `article` for editorial cards on Blogs and Case Studies and self-contained pricing cards.
- Replaced five extra `main` elements in hidden legacy destination content with neutral containers. Existing hidden content remains hidden.
- Retained the existing page headers, footers and thematic sections. Shared call-to-action sections may validly sit outside the main content landmark.
- Kept layout, grid and visual mockup containers as `div`. The audit found no attribute-free single-div wrappers that could be removed without further layout analysis.

These changes clarify document structure and accessibility; they do not guarantee search rankings or indexing. Several existing pages generate their primary content with JavaScript; this review preserves that architecture.

## Maintenance

Follow the semantic HTML rule in AGENTS.md for future pages and shared templates. Choose elements by content purpose, preserving the shared class system and existing presentation.

## Verification

- Compared 49 routes at 390px and 1365px (98 before/after combinations).
- Rendered text, links, heading hierarchy, element counts and element rectangles were unchanged.
- Every rendered route has exactly one `main`; all rendered navigation elements have accessible labels.
- All 48 available mobile menus opened successfully. The icon preview route has no menu.
- No JavaScript page errors; shared JavaScript syntax and Git whitespace checks passed.
- Computed style comparisons were identical except intermittent browser serialization of the unchanged header wrapper's automatic margin shorthand; its position and dimensions were identical.
- External HTTPS assets were blocked equally for both local comparison runs; this check does not validate remote asset availability.
