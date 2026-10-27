# DMC24 Plan Management

Open /plan-management-review through the admin panel. Select a destination; saved settings are independent for each country.

## One-time setup fees
The Setup fees & offers section has four slots: Business, Professional, Professional Plus and Enterprise. Plans not offered in the destination are disabled. Enterprise recurring pricing remains consultation-based.

- Setup fee: USD amount, up to two decimal places. Use 0 for no setup fee.
- Setup discount: percentage from 0 to 100. A 100% active offer waives the fee.
- Offer valid from / through: required for a nonzero discount. Both dates are inclusive in India time.
- Set discount to 0 to remove an offer. Before and after its dates, the standard fee applies automatically.

Use Preview prices on to see subscription and setup offers for a chosen date. Setup fees are charged once and are not added to the monthly/yearly subscription totals shown by the team slider. Additional-user charges are unaffected.

Save Draft stores both subscription and setup settings without changing live pricing. Publish Prices publishes the entire saved country revision together. Reload saved draft discards unsaved changes for that country.

Published setup offers show the original fee, discounted fee, percentage, expiry date and saving on the destination page. Refresh the page to see an update immediately; open destination pages recheck pricing every minute and on returning to the tab. If current fees cannot be retrieved, the page asks visitors to confirm them instead of claiming a stale fee.

## Copying settings
Copy plans to countries lets you choose several or all other destinations. Include source setup fees and setup offers is checked by default, including Enterprise setup. Uncheck it to retain target setup drafts. Copy and publish publishes all resulting saved settings, including retained target setup drafts. Unavailable source/target plan slots retain their target values. Each target remains independently editable afterwards.

## Deployment and data
The setup_draft and setup_published JSON columns are part of country_pricing. Include them in database exports. Deploy migration 0006_sad_tana_nile.sql through the normal migration workflow. Existing records use their rendered destination defaults until setup values are saved; subscription data is not rewritten by this migration.

## Show or hide individual editions

Select a destination, then use **Plans shown on the website** to show or hide Business, Professional, Professional Plus and Enterprise independently. Save Draft, then Publish Prices. The live destination page and country-selected Pricing page use the published settings. The whole-destination checkbox remains separate and immediate.

All existing offered plans default to shown. Plans absent from a destination's feature matrix cannot be enabled with this control. Hiding a plan preserves prices, setup fees, discounts, user limits and features. Re-checking and publishing restores the plan. Bulk-copying prices or setup fees preserves each target country's plan visibility.

The slider uses only visible subscription plans; it is hidden when only Enterprise is shown. If every plan is hidden, the page shows a contact message. Hidden subscription offers are excluded from structured pricing data. Visibility applies in initial HTML and after JavaScript refresh.

Technical storage: optional boolean `visible` on each of the four setup_draft/setup_published JSON slots in country_pricing. No new tables or migration are required. Missing values mean shown; feature availability remains independent. Older clients that omit this property preserve existing saved visibility. Run scripts/test-plan-visibility.mjs after changes to this flow.

## Show pricing independently of the variant
Each edition now also has a **Show pricing** ON/OFF switch. OFF keeps the edition, features and demo link visible while suppressing subscription/setup prices, additional-user charges, discounts and savings. Save Draft and Publish Prices to apply. Existing editions default to ON.

The shared team slider and Monthly/Yearly buttons use only visible subscription plans with pricing ON. When none qualify, those controls disappear. Unpriced variants are not disabled by the team slider. Enterprise's switch controls its setup price and pricing area; it does not add a subscription rate.

The optional `priceVisible` boolean is stored alongside `visible` in the four setup JSON slots. Saved prices are retained in Admin. Public pricing responses redact monetary fields for pricing-OFF editions and exclude their offers from structured data. Legacy saves preserve the setting; bulk-copying prices/setup fees preserves each target's display preferences. Test coverage: scripts/test-price-display.mjs. This controls destination pricing sections and the main Pricing page; previously downloaded documents are not changed.
