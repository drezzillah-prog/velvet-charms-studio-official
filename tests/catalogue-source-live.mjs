import { publicCatalogue, studioCatalogue, BODY_SELLABLE_CATEGORY, BODY_PREVIEW_CATEGORY } from '../lib/catalogue-source.js';

const payload = await publicCatalogue();
if (payload.sourceMode !== 'immutable-pinned') throw new Error('catalogue source mode is not immutable-pinned');
if (payload.sourceCommits.art !== 'a29437db52068129f0c5db9e7a6aa41de96fa929') throw new Error('Art & Gifts source commit changed');
if (payload.sourceCommits.body !== '543bad871521bc1dace35cdf5d02b0f6aa2de279') throw new Error('Body Glow source commit changed');

const saleSections = payload.sections.filter(section => section.kind !== 'preview');
const previewSections = payload.sections.filter(section => section.kind === 'preview');
if (!saleSections.length) throw new Error('no sellable Studio sections loaded');
if (!previewSections.some(section => section.category?.name === BODY_PREVIEW_CATEGORY)) throw new Error('candle preview section missing');
if (!saleSections.some(section => section.source === 'body' && section.category?.name === BODY_SELLABLE_CATEGORY)) throw new Error('approved Body Glow textile section missing');
if (saleSections.some(section => section.source === 'body' && section.category?.name !== BODY_SELLABLE_CATEGORY)) throw new Error('unapproved Body Glow category entered sale allowlist');
if (saleSections.some(section => section.source === 'art' && section.category?.name === 'Bundles')) throw new Error('Art & Gifts Bundles entered sale allowlist');

const flatten = category => [
  ...(category.products || []),
  ...(category.subcategories || []).flatMap(sub => sub.products || [])
];
const saleProducts = saleSections.flatMap(section => flatten(section.category).map(product => ({...product, source: section.source})));
for (const blockedId of ['epoxy_lamp', 'wall_clock_large']) {
  if (saleProducts.some(product => product.id === blockedId)) throw new Error(`blocked product entered public sale payload: ${blockedId}`);
}
if (!saleProducts.every(product => product.id && product.name && Number.isFinite(Number(product.price)))) throw new Error('sellable product missing id, name or price');

const serverMap = await studioCatalogue();
if (serverMap.size !== saleProducts.length) throw new Error(`public/server sellable counts diverge: public=${saleProducts.length}, server=${serverMap.size}`);
for (const [key, product] of serverMap) {
  if (!/^(art|body):/.test(key)) throw new Error(`invalid server product key ${key}`);
  if (key.startsWith('body:') && product.__source !== 'body') throw new Error(`Body source mismatch for ${key}`);
}

console.log(`Velvet Charms Studio immutable catalogue source PASS — ${serverMap.size} sellable products, ${previewSections.reduce((sum, section) => sum + flatten(section.category).length, 0)} preview candle products`);
