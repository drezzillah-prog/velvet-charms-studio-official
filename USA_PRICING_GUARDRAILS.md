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
| Solid Perfume 50 ml | $32 |
| Perfume Oil Roll-On 10 ml | $22 |
| Exfoliating Glycerin Soap 100 g | $14 |
| Herbal Glycerin Soap 100 g | $14 |
| Flower-Shaped Glycerin Soap 100 g | $16 |
| Fruit-Shaped Glycerin Soap 100 g | $16 |

## Sign-off rule

Before STORE_LIVE=true, replace every unknown cost with a real invoice/quote value and calculate profit per unit. If the resulting margin is below the business target, raise price, lower cost, change pack/size, or do not launch that SKU. Never silently reduce paid labor to make the margin appear viable.

Fragrance-gated and supplier-formula-gated products remain blocked regardless of pricing status until their existing technical launch gates are cleared.
