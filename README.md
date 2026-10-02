# Velvet Charms Studio USA — storefront architecture

This repository is the **only writable codebase for Velvet Charms Studio USA**.

## Non-negotiable isolation rule

The original Velvet Charms websites are source references only and must not be modified by Studio work:

- `drezzillah-prog/velvet-charms-body-glow-official`
- `drezzillah-prog/velvet-charms-art-gifts-official`

Studio may read pinned catalogue/image snapshots from them. It must never delete, rename, rewrite, merge into or otherwise alter either original repository.

## Non-negotiable catalogue rule

**Do not collapse Studio USA back to a small body-care-only catalogue.**

The customer catalogue is the union of:

1. the complete pinned Art & Gifts catalogue;
2. the pinned Body Glow `Knitted & Braided Wool Creations` collection;
3. the Studio-owned U.S. care/fragrance/soap subset;
4. Life Chapters as the made-to-order commission universe.

The current pinned source snapshots are:

- Art & Gifts: `a29437db52068129f0c5db9e7a6aa41de96fa929`
- Body Glow: `543bad871521bc1dace35cdf5d02b0f6aa2de279`

Art & Gifts bundles and the powered lamp/clock remain visible to the customer as **custom inquiry** pieces rather than entering standard checkout.

## Studio-owned U.S. care subset

Current care products:

- Body Butter — unscented;
- Nourishing Face Balm — unscented;
- Hand & Foot Balm — unscented;
- same-formula refills — unscented;
- Solid Perfume — IVORY HOUR, VEILED, BLACK HONEY, SACRED SMOKE;
- selected glycerin soaps.

There is **no Perfume Oil Roll-On product in the Studio USA catalogue**.

Do not add a scent selector to the unscented body balms or their refills.

Solid perfume uses weight-based sizes:

- Net Wt. 0.18 oz / 5 g;
- Net Wt. 0.35 oz / 10 g.

## Public-copy rule

Customer-facing pages must not expose internal project-management or deployment language such as:

- “V1”;
- “pre-launch” / “launch gates”;
- `STORE_LIVE`;
- “documentation pending”;
- source-snapshot / source-pin explanations;
- internal regulatory work notes.

Customer-facing alternatives are simple statuses such as **Coming soon**, **Custom inquiry**, or **Online checkout is temporarily unavailable**.

Technical gates remain server-side.

## Checkout

Studio USA uses USD and a U.S. market gate. Standard checkout uses PayPal when enabled.

Server-side checkout must:

- validate every product against the current Studio catalogue;
- reject custom-inquiry / coming-soon products;
- validate quantity and allowed options;
- validate the U.S. market;
- keep payment creation and capture behind the store-live gate;
- never hardcode PayPal secrets.

## Life Chapters

Velvet Vows, Velvet Tides and Velvet Beginnings remain part of Studio USA. Large/custom catalogues should use:

- clear customer-facing product descriptions;
- `Made to order`, `Custom quote`, or similar customer statuses;
- representative example photos rather than requiring unique imagery for every variation;
- contact/quote CTAs for highly customized pieces.

## Integrity

Run:

```bash
npm test
```

Tests should protect the full-catalogue architecture, the source-repository isolation rule, unscented body-care options, the absence of roll-on perfume, customer-facing copy hygiene, server-side checkout gates and the approved Studio-owned solid-perfume images.
