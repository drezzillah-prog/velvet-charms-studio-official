# Velvet Charms Studio USA — official

Separate USA-focused V1 cosmetics storefront for the Velvet Charms umbrella brand.

## Repository isolation

This repository owns the Studio USA implementation. `velvet-charms-body-glow-official` remains an immutable product-asset/source reference at commit `543bad871521bc1dace35cdf5d02b0f6aa2de279`. Art & Gifts is a separate EU storefront and is not part of Studio USA checkout.

## USA V1 scope

Planned families:
- Body Butter — 100 ml retail fill; 100 g development formula basis.
- Nourishing Face Balm — 50 ml retail fill; 100 g development formula basis.
- Hand & Foot Balm — 50 ml retail fill; 100 g development formula basis.
- Solid Perfume — 50 ml.
- Perfume Oil Roll-On — 10 ml.
- Glycerin/melt-and-pour soaps — 100 g source format where verified.

Water-based creams and candles are outside V1. Citrus Bloom remains outside the frozen V1 definitions until exact leave-on-suitable materials and percentages are documented.

The controlled formulas are development starting formulas, not automatic commercial clearance.

## Product gates

Supplier-dependent soap products are rejected server-side until the exact documented melt-and-pour base and compatible additive levels are frozen. Fragrance-gated solid perfumes and roll-ons are also rejected server-side until their material/supplier documentation and applicable restrictions are cleared. `STORE_LIVE` is an additional global launch gate.

## Checkout architecture

Studio USA has its own isolated PayPal flow. `/api/create-order.js` validates U.S. market eligibility, cart contents, quantities, options and server-side USD prices. `/api/capture-order.js` re-validates the cart, verifies the PayPal order metadata/fingerprint, items, currency and amount before capture. The client securely matches the PayPal return token to the checkout session before calling capture.

Checkout currency is USD and the server market is US only. No PayPal secret is stored in the repository.

Keep `STORE_LIVE` false or unset until the external launch gates are complete. LIVE variables when launch is authorized are `STORE_LIVE=true`, `PAYPAL_ENV=live`, `PAYPAL_CLIENT_ID`, and `PAYPAL_CLIENT_SECRET` (or `PAYPAL_SECRET`). Optional seller notification uses `FORMSPREE_ENDPOINT` or `FORMSPREE_FORM_ID`.

## External launch gates

Before public checkout is enabled: establish and publish the actual legal seller/operator details required for the launch; finalize customer contact, shipping and return terms; verify the LIVE PayPal credentials belong to the intended account; complete a controlled end-to-end payment test; freeze final exact commercial formulas and supplier documentation; complete safety substantiation and final labels; establish the applicable U.S. manufacturing/recordkeeping and adverse-event process; and verify any applicable U.S. cosmetic registration/listing obligations or exemptions.

Do not claim “FDA Approved” and do not use drug/treatment claims for V1 cosmetics.

See `PRODUCT_LAUNCH_MATRIX.md`.

## Integrity tests

Run `npm test`. GitHub Actions runs the Studio Integrity contract on the working PR. The contract covers immutable source pins, USA/USD architecture, server-side market/product gates, PayPal return/capture integrity, `STORE_LIVE`, and absence of hardcoded PayPal secrets.
