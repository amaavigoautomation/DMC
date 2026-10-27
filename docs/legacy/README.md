# DMC24 website source

The publishable static website is in `dist/`. Sites uses `dist` as its public root, so `dist/index.html` is the home page. Every other page remains a top-level `.html` file alongside it.

```
dist/
├── index.html
├── [other pages].html
├── css/main.css
├── js/main.js
└── img/[local images]
```

## Adding a page

1. Copy the shared header, footer and navigation structure from a current page, retaining the existing content patterns and links.
2. Give both `<html>` and `<body>` a matching `data-page="your-page"` value for JavaScript behavior dispatch only. Include `css/main.css` in the head and `js/main.js` at the end of the body.
3. Reuse global `.container`, `.btn`, `.card`, heading, grid and CTA classes when their designs match. Use base classes plus semantic modifiers for genuine differences. Never add a page-name selector or a route to CSS to enable styling.
4. Add new behavior as a named function in `js/main.js` and register it for the page in `pageModules`. Keep the existing order of shared and page logic.
5. Place new local images in `img/`. In HTML and JavaScript use `img/name.ext`; in CSS use `../img/name.ext`.
6. Check desktop and mobile pages, menus, pricing controls, local image paths and browser console before publishing.

Do not run the retired page generator or add page-specific CSS/JS files. Existing remote images remain at their original URLs to preserve the approved visual content.

## Shared components and visual variants

Same design → same class → one shared rule. A new page can use these directly without being registered in CSS:

```html
<section>
  <div class="container">
    <div class="section-head">
      <h2>Section heading</h2>
      <p class="lead">Supporting text</p>
    </div>
    <div class="cards-3">
      <article class="card"><h3>Card heading</h3><p>Card text</p></article>
      <article class="card card--soft"><h3>Card heading</h3><p>Card text</p></article>
    </div>
    <a class="btn btn-primary" href="request-demo.html">Request a Demo</a>
  </div>
</section>
```

| Component | Existing variation |
| --- | --- |
| `h1`, `h3` | `heading--compact` preserves the alternate type scale |
| `h2` | `heading--large` preserves the larger minimum size |
| `.card` | `.card--soft` changes shadow and paragraph treatment |
| `.page-hero` | `.page-hero--glow` adds the existing glow treatment |
| `.product-grid` | `.product-grid--four` uses the four-column responsive layout |
| `.cta` | `.cta--compact` preserves the alternate spacing and gradient |
| Destination components `.db-*` | `--cool` preserves the alternate destination visual system |

Modifiers are explicit in HTML and in rendering templates. Root theme classes contain palette tokens; they do not scope ordinary component selectors. Simple `:where()` conditions preserve the existing CSS specificity without page scoping. Keep those conditions when modifying variants so component and responsive overrides retain their established precedence.

The shared destination renderer reads `data-destination-style="cool"` from its script include when that visual variant is wanted. The compact shell accepts `data-cta-style="hidden"` when the enclosing design supplies its own final CTA. Neither option depends on a page URL.
