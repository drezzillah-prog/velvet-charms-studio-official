# Velvet Charms Studio USA — V1 launch matrix

Studio USA is a separate U.S.-focused cosmetics storefront. Body Glow remains an immutable source reference and Art & Gifts remains a separate EU storefront.

## V1 catalogue

### Controlled development formulas
- Body Butter — 100 ml retail fill; formula code VC-BB-001.
- Nourishing Face Balm — 50 ml retail fill; VC-FB-001.
- Hand & Foot Balm — 50 ml retail fill; VC-HFB-001.

The percentage formulas use a 100 g prototype/development batch basis. Retail fill and formula basis are intentionally separate fields.

### Fragrance-gated
- Solid Perfume: Vanilla Orchid, Amber Wood, Sandalwood Rose, White Musk — 50 ml.
- Perfume Oil Roll-On: Lavender Mist, Cedar & Amber, Floral Spice — 10 ml.

These remain server-blocked with `PRODUCT_NOT_READY` while supplier/fragrance documentation and applicable restrictions are unresolved.

### Supplier-formula-gated
- Exfoliating Glycerin Soap.
- Natural Herbal Glycerin Soap.
- Flower-Shaped Glycerin Soap.
- Fruit-Shaped Glycerin Soap.

No universal melt-and-pour percentages are invented. These remain server-blocked until the exact documented cosmetic-grade base and compatible additive levels are frozen.

### Outside frozen V1
- Citrus Bloom roll-on: exact leave-on-suitable citrus materials and final percentages not frozen.
- Water-based creams: Phase 2.
- Candles: separate workstream.
- Art, textiles, leather, epoxy/clay and EU bundles: Art & Gifts, not Studio USA.

## Checkout protections

- Currency: USD.
- Market: United States only; non-US requests are rejected server-side.
- `STORE_LIVE` must remain false/unset during prelaunch.
- Product, quantity, customization and price are validated server-side.
- PayPal order metadata contains the US market and a cart fingerprint.
- Capture re-validates the cart and checks PayPal items, USD currency and total before capture.
- The browser matches the PayPal return token to the saved checkout order before requesting capture.
- No PayPal secret is stored in repository code.

## External gates before public sale

1. Establish the actual legal seller/operator information and publish the required customer-facing details.
2. Finalize customer contact, U.S. shipping and return/refund terms.
3. Verify LIVE PayPal credentials belong to the intended account.
4. Complete a controlled end-to-end LIVE payment verification before opening public checkout.
5. Freeze final commercial formulas and ingredient grades; retain supplier/lot documentation.
6. Complete safety substantiation and final compliant labels for each product.
7. Complete fragrance/material restriction review for fragrance-gated products.
8. Complete supplier-base documentation for melt-and-pour soaps.
9. Establish applicable manufacturing/batch records and adverse-event handling.
10. Verify applicable U.S. cosmetic registration/listing requirements or exemptions for the actual operator/products.
11. Only after the above gates pass, set `STORE_LIVE=true` in the correctly bound Studio USA Vercel project.

The prelaunch site must not claim “FDA Approved” or make drug/treatment claims.

## Immutable source reference

Body Glow assets/source catalogue: `543bad871521bc1dace35cdf5d02b0f6aa2de279`. This reference does not authorize modifications to Body Glow.
