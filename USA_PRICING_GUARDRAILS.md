# Velvet Charms Studio USA — Pricing Guardrails

Status: pre-launch pricing control. This document does not authorize STORE_LIVE.

## Rule

A market-comparable retail price is not enough. No SKU is financially approved until its real unit economics are filled from supplier invoices or current purchase quotes.

For every SKU record:
- ingredients/materials actually consumed per sellable unit;
- normal waste/spillage/test-batch allowance;
- primary vessel/container and closure;
- label, insert, protective packaging and shipping packaging;
- hands-on labor minutes and the chosen paid hourly labor rate;
- allocated overhead (tools, utilities, software, consumables, rejected units);
- payment/platform fees that apply to the actual sales channel;
- any seller-paid fulfillment/shipping;
- discount/promotional buffer;
- target operating profit.

Do not count owner labor as profit. Labor is a cost paid before business profit.

## Margin calculation

Loaded unit cost = materials + waste + vessel + packaging + paid labor + allocated overhead + seller-paid fulfillment.

Net contribution = retail price - loaded unit cost - variable payment/platform fees.

Net contribution margin = net contribution / retail price.

The current USA retail matrix is a market-positioning proposal. It is NOT a claim that a SKU has passed margin review while any real cost input is missing.

## USA V1 retail matrix

| Product | Retail |
| --- | ---: |
| Body Butter 100 ml | $28 |
| Nourishing Face Balm 50 ml | $32 |
| Hand & Foot Balm 50 ml | $26 |
| Body Butter Refill | $22 |
| Nourishing Face Balm Refill | $25 |
| Hand & Foot Balm Refill | $21 |
| Solid Perfume 0.35 oz / 10 g | $32 |
| Exfoliating Glycerin Soap 100 g | $14 |
| Herbal Glycerin Soap 100 g | $14 |
| Flower-Shaped Glycerin Soap 100 g | $16 |
| Fruit-Shaped Glycerin Soap 100 g | $16 |

## Sign-off rule

Before STORE_LIVE=true, replace every unknown cost with a real invoice/quote value and calculate profit per unit. If the resulting margin is below the business target, raise price, lower cost, change pack/size, or do not launch that SKU. Never silently reduce paid labor to make the margin appear viable.

Fragrance-gated and supplier-formula-gated products remain blocked regardless of pricing status until their existing technical launch gates are cleared.



## Imported handmade collection — current USA positioning

The Studio does not display the original European list price with a dollar sign. The U.S. storefront has an explicit USD positioning matrix for the pinned Art & Gifts and textile catalogue. These are commercial list-price proposals, not proof of margin.

Representative anchors:
- Small Landscape Painting — $69
- Medium Landscape Painting — $119
- Large Landscape Painting — $199
- 2D Portrait — $169
- 3D Portrait Relief — $249
- Couple or Family Portrait — $319
- Custom Hair Set — $79
- Epoxy Tray — $79
- Leather Bag Small / Medium / Large — $159 / $229 / $299
- Hand-Knitted Beanies — $59–$74
- Hand-Knitted Scarf — $99
- Matching Winter Set — $229
- Braided Blankets — $219 / $399 / $589
- Felted Animal Small / Medium — $49 / $85
- Felted Animal Family Set — $219

The full map lives in `lib/catalogue-source.js`. Before online checkout is enabled for any imported handmade SKU, replace unknown material, labor, packaging and seller-paid fulfillment assumptions with real current costs and re-run the margin check.
