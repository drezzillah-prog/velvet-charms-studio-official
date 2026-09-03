# Velvet Charms Studio — official

Independent Phase 1 storefront for the Velvet Charms umbrella brand.

## Non-negotiable isolation rule

This repository is the **only writable codebase for Velvet Charms Studio**.

The existing repositories remain separate and are read-only source references:

- `drezzillah-prog/velvet-charms-body-glow-official`
- `drezzillah-prog/velvet-charms-art-gifts-official`

Studio never writes to, deletes from, renames, migrates, restructures, merges into or otherwise modifies either original repository.

## Immutable source snapshots

The Studio catalogue reads fixed, immutable commits:

- Art & Gifts: `a29437db52068129f0c5db9e7a6aa41de96fa929`
- Body Glow: `543bad871521bc1dace35cdf5d02b0f6aa2de279`

This prevents later changes in the original websites from silently changing the Studio launch selection.

## Phase 1 sale allowlist

### Art & Gifts
Sellable from the Art & Gifts snapshot except:

- `Bundles` — excluded because current bundle recipes include candles and/or cosmetics;
- `epoxy_lamp` — excluded pending separate powered/electrical product conformity review;
- `wall_clock_large` — excluded pending separate powered/electrical mechanism conformity review.

### Body Glow source
Sellable:

- `Knitted & Braided Wool Creations` only.

Preview only, never server-accepted for checkout:

- `Candles`, pending formulation-specific CLP / safety-label review.

Explicitly excluded from Studio Phase 1 sale:

- Body Care;
- Soaps;
- Perfumes;
- cosmetic refills;
- bundles containing cosmetics or uncleared candles.

The full Body Glow and Art & Gifts websites remain intact for their later separate relaunch under the Velvet Charms Studio umbrella.

## Checkout architecture

Studio has its own isolated PayPal flow:

- `/api/create-order.js` validates every cart item, quantity, option and server-side price against the Studio allowlist before creating a PayPal order;
- `/api/capture-order.js` re-validates the cart and compares the approved PayPal items and total before capture;
- checkout settles in EUR;
- Romanian list prices can be displayed in RON while the corresponding deterministic Studio EUR amount is used for PayPal;
- no PayPal secret is stored in the repository.

Public payment creation is additionally gated by `STORE_LIVE=true`. Keep it false or unset until legal identity and the real PayPal account are verified.

Required Vercel environment variables for live checkout:

- `STORE_LIVE=true`
- `PAYPAL_ENV=live`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET` (or `PAYPAL_SECRET`)

Optional order/contact notification variables:

- `FORMSPREE_ENDPOINT` or `FORMSPREE_FORM_ID`

## Remaining external launch inputs

Code can be deployed safely before checkout is enabled. Before setting `STORE_LIVE=true`, complete these real-world inputs:

1. final PFA legal name, registration/fiscal identifiers and professional address;
2. official customer-contact email/details;
3. PayPal LIVE credentials belonging to the intended business account;
4. controlled real end-to-end payment verification;
5. final shipping process and customer-facing shipping wording;
6. product-safety/GPSR information for the Phase 1 sale products;
7. candle-specific review remains separate and candles stay non-sale until cleared.

See `PRODUCT_LAUNCH_MATRIX.md`.

## Integrity tests

Run:

```bash
npm test
```

The test contract checks immutable source pins, the cosmetic/electrical exclusion gates, server-side validation, checkout launch gating and the absence of hardcoded PayPal secrets. GitHub Actions runs the same contract for repository changes.
