# DMC24 loading-speed improvements

Applied across all 49 routes, preserving authored HTML content and the shared component system.

- Minified delivery assets: `dist/css/main.min.css` and `dist/js/main.min.js`. Readable sources remain in `main.css` and `main.js`.
- One shared script per page now downloads from the head with `defer`, retaining its data attributes and ordered initialization.
- Asset URLs include content hashes as cache-busting query parameters.
- Below-the-fold content and footer images use native lazy loading. Hero images remain eager. Images use asynchronous decoding; local images receive their intrinsic dimensions when absent.
- Two large PNG assets are served as lossless WebP. Decoded RGBA pixels were verified identical. Original PNG sources are retained.
- Existing shared stylesheet remains render-blocking deliberately to preserve first-paint styling. No CSS preload duplication or unstyled-content flash was introduced.
- No heavy inline CSS blocks exist in HTML. Small data-dependent inline styles in shared templates (chart values, destination images and display state) remain; moving them would not produce meaningful payload savings.
- CSS backgrounds are not eligible for `loading="lazy"`; their existing behavior remains unchanged.

## Maintenance

After changing authored CSS, JavaScript or adding a page, run:

`NODE_PATH=/path/to/node_modules node scripts/minify-assets.cjs`

The utility requires esbuild (installed separately); it introduces no browser dependency or mandatory framework build. It regenerates minified delivery files, hashes and references on all HTML pages. Commit sources and generated outputs together. Preserve one stylesheet link and one executable shared script per page. Run the schema generator before the minification utility when updating both.

## Measurements

CSS: 248,905 to 193,175 bytes (22.4% reduction).
JavaScript after image-attribute improvements: 193,435 to 184,893 bytes (4.4% reduction). Most of its size is HTML template content.
Combined delivery CSS/JS: approximately 14.4% smaller than the previous 441,840-byte files, before HTTP compression.
Destination hero PNG: 1,122,282 to 553,360 bytes (50.7% reduction).
Architecture PNG: 1,466,923 to 1,109,282 bytes (24.4% reduction).
The two lossless image conversions save 926,563 bytes combined.

These are file-size measurements, not Lighthouse/Core Web Vitals results. Actual visitor timings depend on hosting, network, remote imagery and browser caching. Remote assets are blocked equally in the local before/after layout comparison.

## Validation

- All 49 pages compared at 390px and 1365px: identical visible text, links, headings and element rectangles.
- Intentional logo class additions preserve proportional sizing with width/height attributes. The only other computed-style difference was the browser's automatic-margin shorthand serialization with identical geometry.
- All available mobile menus passed; desktop product-menu hover passed.
- Monthly/yearly pricing round trips and setup fees passed for Sri Lanka, Hong Kong, Singapore, Malaysia and Maldives.
- Destination filtering passed; no JavaScript page errors.
- Image source/alt audit refreshed; minified JavaScript syntax and whitespace checks passed.
