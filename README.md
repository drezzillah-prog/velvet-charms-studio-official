# Velvet Charms Studio — official

Independent Phase 1 storefront for the Velvet Charms umbrella brand.

## Isolation rule

This repository is the **only writable codebase for Velvet Charms Studio**.

The existing repositories remain separate and must be treated as read-only source references:

- `drezzillah-prog/velvet-charms-body-glow-official`
- `drezzillah-prog/velvet-charms-art-gifts-official`

Studio never writes to, deletes from, renames, migrates, or restructures either original repository.

## Phase 1 catalogue rule

Studio loads immutable catalogue snapshots pinned to known commits of the two original projects.

For sale in Phase 1:

- all Art & Gifts catalogue categories;
- Body Glow `Knitted & Braided Wool Creations` only.

Visible but **not for sale**:

- Body Glow `Candles`, pending formulation-specific CLP / safety-label review.

Explicitly excluded from Studio Phase 1 sale:

- Body Care;
- Soaps;
- Perfumes;
- cosmetic refills;
- mixed bundles containing cosmetics or candles not yet cleared.

The full Body Glow and Art & Gifts websites remain intact for their later separate relaunch under the Velvet Charms Studio umbrella.

## Current files

- `index.html` — umbrella / launch homepage
- `catalogue.html` — combined Phase 1 catalogue
- `styles.css` — Studio visual system
- `studio.js` — immutable source loading, filtering and sale guard

Checkout will be connected only inside this repository after the Studio payment environment is configured and independently verified.
