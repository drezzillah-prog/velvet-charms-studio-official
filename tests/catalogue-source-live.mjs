import { publicCatalogue, studioCatalogue, STUDIO_CURRENCY, STUDIO_MARKET } from '../lib/catalogue-source.js';

const payload = await publicCatalogue();
if (payload.sourceMode !== 'immutable-pinned-us-v1') throw new Error('catalogue source mode is not immutable-pinned-us-v1');
if (payload.sourceCommits.body !== '543bad871521bc1dace35cdf5d02b0f6aa2de279') throw new Error('Body Glow source commit changed');
if (STUDIO_CURRENCY !== 'USD' || payload.currency !== 'USD') throw new Error('USA Studio must use USD');
if (STUDIO_MARKET !== 'US' || payload.market !== 'US') throw new Error('USA Studio market gate missing');
if (!payload.sections.length) throw new Error('no USA V1 sections loaded');
if (payload.sections.some(section => section.source !== 'body' || section.kind !== 'us-v1')) throw new Error('non-USA-V1 source entered catalogue');

const flatten = category => [
  ...(category.products || []),
  ...(category.subcategories || []).flatMap(sub => sub.products || [])
];
const products = payload.sections.flatMap(section => flatten(section.category));
const allowed = new Set(['body_butter_100','face_cream','hand_foot_cream','solid_perfume','perfume_rollon','soap_exfoliating','soap_moisturizing','soap_herbal']);
if (products.some(product => !allowed.has(product.id))) throw new Error('product outside approved USA V1 entered catalogue');
for (const id of allowed) if (!products.some(product => product.id === id)) throw new Error(`approved USA V1 product missing from source: ${id}`);
if (!products.every(product => product.id && product.name && Number.isFinite(Number(product.price)))) throw new Error('USA V1 product missing id, name or price');
if (!products.every(product => product.__launch_status === 'compliance-gated')) throw new Error('USA compliance gate metadata missing');

const serverMap = await studioCatalogue();
if (serverMap.size !== products.length) throw new Error(`public/server counts diverge: public=${products.length}, server=${serverMap.size}`);
for (const [key, product] of serverMap) {
  if (!key.startsWith('body:') || product.__source !== 'body') throw new Error(`source mismatch for ${key}`);
}

console.log(`Velvet Charms Studio USA V1 catalogue PASS — ${serverMap.size} compliance-gated products in USD`);
