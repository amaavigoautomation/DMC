# Schema and heading corrections

- Case Studies card headings now use H2 with the existing card-scale styling.
- `/vishal-shah` contains the owner-supplied bio and LinkedIn URL, a ProfilePage/Person graph and a server-rendered list of published articles by this author. The shared person identifier is `/vishal-shah#person`. Blog bylines and the adoption guide link to this profile. No independent credential verification or invented portrait/rating is implied.
- Original blog publication dates were verified against successful deployments: v102 (04:58:10Z), v103 (05:06:42Z), v104 (05:13:43Z), v105 (06:14:37Z), all 6 October 2026. The guide first deployed successfully in v55 on 25 September 2026 at 11:16:59Z. Six illustrative case studies first deployed in v152 on 10 October 2026 at 14:03:06Z. ARTICLE_DATES.json records these facts; dates are not refreshed on each build.
- Existing CMS rows with missing publication dates are filled by the one-time publication-dates-v1 content upgrade. Existing dates, publication state and draft content remain intact. Revision guards prevent concurrent overwrites. Preserve blog_state during exports.
- Public destination HTML and the pricing API use the same published-only calculations. HTML contains monthly/yearly prices, user allowances, additional-user terms, setup fees and current discounts without JavaScript. The interactive slider hydrates from this snapshot and refreshes pricing and offers from the same API.
- Software offers identify the country edition, plan, currency and billing period. Setup fees are disclosed separately; Enterprise remains by consultation. No aggregateRating or review is fabricated. Discount boundaries use India time. API/storage failures do not silently present old build-time prices as current.
- FAQ graphs are built from actual visible editorial answers on destination, adoption and pricing pages. Resource links and slider labels are excluded. These markups describe content; they do not guarantee Google or AI visibility.
- Product and destination pages do not acquire personal author bios or personal author schema.

Validation: test-schema-corrections, test-blog-cms, test-blog-authors, test-blog-ordering, test-editorial-review, test-seo, test-seo-management, test-setup-fees and test-demo-requests. Visual browser QA was unavailable.
