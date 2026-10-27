# DMC24 Blog Management

Open /blog-management from the existing admin dashboard. The review prototype is retained separately and does not save to the live database.

## Editor workflow

Select an article or New article. Enter title, category, author, excerpt and formatted body. Use H2/H3, lists, emphasis and links. Upload a JPG/PNG/WebP featured image up to 2 MB and enter descriptive alt text. Set SEO title (60 characters), description (160), optional social title/description and related internal links. The article URL becomes permanent after its first save. Canonicals follow the configured site origin automatically.

Save draft stores content in D1 without changing the live version. Preview shows the unsaved draft. Publish saves and publishes current edits after confirmation. Unpublish and Archive remove the public article and its list/sitemap entry while retaining its draft. Reopen and publish to restore. Publication date can be today or earlier; scheduling is not implemented. JSON download exports current editor fields; image files must be backed up separately.

## Storage and migration

D1 tables: blog_posts stores draft and published JSON, immutable slugs, revision counters and timestamps; blog_state records the one-time 13-article import; blog_media records uploaded image metadata. R2 BUCKET stores image objects under blog-media/. Import is outside schema migrations and runs once on the first CMS/blog/sitemap request. It preserves original URLs, article text and links; no invented historical publication dates are assigned to imported articles. All changes after import live in the database and will survive code deployments.

For external hosting, export all existing D1 tables including blog_posts, blog_state and blog_media, and copy every R2 blog-media/ object. Configure equivalent database and object-storage adapters, install dependencies including parse5, retain server-side sessions and CSRF/revision protections, and configure the final site origin before launch. A source ZIP alone does not include runtime D1 data or R2 objects. Source seed content is only the original import, not subsequent edits.

## Public delivery and SEO

Published articles are server-rendered at their original or saved extensionless routes. New .html/trailing-slash aliases redirect to the canonical route. Drafts and archived/unpublished records cannot fall back to old static HTML. Blog listing, category filtering and sitemap use the database. Article HTML has one H1, breadcrumbs, canonical, social tags and BlogPosting JSON-LD. Draft updates do not change public content or modification dates. Article SEO is managed in Blog Management; existing article entries are excluded from the separate SEO editor to avoid competing overrides.

Media is accessible to administrators before publication and to public visitors only while referenced by a published post (subject also to site hosting access). Image bytes are validated by size, content type and file signature. The server sanitises rich text with an allowlist; executable HTML and unsafe links are stripped. Admin actions use existing authentication, origin checks and revision comparisons.

Tests: scripts/test-blog-cms.mjs exercises imports, authentication, CSRF, concurrency, publication, draft isolation, list/sitemap updates, URL conflicts, sanitisation, image persistence/access and the actual client editor against the server.

## Website display order

Open Website display order in Blog Management. All Articles and each category have independent arrangements. Drag a row or use Move up / Move down; visible numbers show position within the selected list. Select one featured article to place it prominently above the overall listing without duplication; its category still follows the independent category order. Reset a view with Use newest-first in this view. Articles not explicitly positioned follow manually positioned articles in publication-date order, with first-publication timestamp and URL as stable tie-breakers. Saving an article draft never changes this fallback order.

Save ordering draft stores all arrangements privately. Preview order displays the current unsaved view using published article content. Publish order saves and publishes all category orders, the overall order and featured choice together. Other editor sessions are protected by revision checks. Reload ordering after publishing a new article or changing its category. Draft/archived records are excluded; unpublished featured articles disappear automatically. Category changes use the published category, not an unpublished article draft. The article library has separate Published, Draft, Archived and All status filters.

Export the blog_ordering D1 table as well as the other CMS tables when migrating. It contains a single main record with draft/published settings and independent revision metadata. No article content, publication date or URL needs changing to set display priority. Run scripts/test-blog-ordering.mjs for ordering changes.

## Author attribution
The editor includes author name, a short bio/credentials (600 characters), and an HTTPS professional profile URL (500 characters). New drafts prefill Vishal Shah’s approved profile; all fields remain editable per article. Preview includes the author block. Save draft keeps changes private; Publish article updates the visible byline, bio, link and BlogPosting Person metadata together. No author photo or independently verified status is implied.

The author-editorial-v1 content upgrade applies the owner-approved author to existing draft and published articles independently, keeps unpublished records hidden, preserves display ordering, and uses revision guards. It only replaces an introduction when it exactly matches the original imported text; modified introductions remain intact. It bolds existing short answers below question headings without inventing claims. Preserve blog_state during database transfers so this one-time upgrade is not repeated.
