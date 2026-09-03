# Velvet Charms Studio — Phase 1 launch matrix

This repository is the only writable repository for the Studio launch project. The two existing storefront repositories are source references only and must remain untouched.

## Sellable in Phase 1

### Art & Gifts
All products from the immutable Art & Gifts catalogue snapshot are eligible **except**:
- the entire `Bundles` category, because current bundle recipes include candles and/or cosmetic products;
- `epoxy_lamp`, because powered/electrical product conformity must be reviewed separately;
- `wall_clock_large`, because the finished powered/electrical mechanism must be reviewed separately.

The server-side checkout allowlist enforces these exclusions independently of the browser UI.

### Body Glow source
Only the category `Knitted & Braided Wool Creations` is sellable in Phase 1.

## Preview only

### Candles
The category `Candles` is visible as a non-sale preview. Checkout is disabled until each intended launch formula has its formulation-specific CLP/safety-label review completed. Natural/essential-oil fragrance does not automatically remove CLP duties.

## Not sold in Phase 1

The Studio checkout does not allow Body Care, Soaps, Perfumes, cosmetic refills or bundles containing cosmetic products. These remain for the later dedicated Body Glow release after cosmetic compliance is completed.

## Launch gates

Public payment creation requires `STORE_LIVE=true` in the Studio Vercel project. Do not enable that variable until all of the following are complete:
1. PFA legal operator details are inserted into `legal.html`.
2. Official customer contact details are final.
3. PayPal LIVE credentials are confirmed to belong to the intended business PayPal account.
4. A controlled end-to-end payment test has succeeded.
5. Shipping wording and process are confirmed.
6. The product-safety/GPSR information to accompany the Phase 1 products is completed.
7. Candle products remain non-sale unless their separate review is complete.

## Immutable source commits
- Art & Gifts: `a29437db52068129f0c5db9e7a6aa41de96fa929`
- Body Glow: `543bad871521bc1dace35cdf5d02b0f6aa2de279`

These sources are read-only. Studio writes must never target either original repository.
