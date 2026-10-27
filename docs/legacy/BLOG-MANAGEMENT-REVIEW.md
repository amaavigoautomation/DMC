# Blog Management review

Protected route: /blog-management-review. Registered in the shared admin panel and protected by its existing session.

This is a review prototype, not a live CMS. Thirteen existing blogs are copied into the initial library. Editing, draft save, image selection, preview, simulated publication and archive affect only this browser tab session. JSON export preserves a draft for review. Images are limited to 1 MB. No database writes, public article replacement or live publishing occurs. Closing the tab may clear drafts.

After approval: implement revision-controlled database drafts and publication, persistent media storage, content migration preserving public URLs, author controls, canonical/social settings, public listing/category feeds and sitemap integration. The review supports safe plain-text blocks with H2/H3 and bullet formatting; full rich-text editing is a production enhancement.
