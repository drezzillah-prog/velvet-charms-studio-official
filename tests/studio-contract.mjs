import fs from 'node:fs';

const required=[
  'index.html','catalogue.html','faq.html','contact.html','legal.html',
  'classics.html','scent.html','life-chapters.html','studio.js','studio-brand.css',
  'data/us-v1-products.js','lib/catalogue-source.js','api/create-order.js','api/capture-order.js',
  'assets/velvet-charms-usa-hero.jpg',
  'assets/solid-perfume-ivory-hour.svg','assets/solid-perfume-veiled.svg',
  'assets/solid-perfume-black-honey.svg','assets/solid-perfume-sacred-smoke.svg','USA_IMPORTED_CATALOGUE_PRICING.md'
];
for(const file of required) if(!fs.existsSync(file)) throw new Error('required Studio file missing: '+file);

const defs=fs.readFileSync('data/us-v1-products.js','utf8');
const source=fs.readFileSync('lib/catalogue-source.js','utf8');
const studio=fs.readFileSync('studio.js','utf8');
const styles=fs.readFileSync('styles.css','utf8');
const brand=fs.readFileSync('studio-brand.css','utf8');
const createOrder=fs.readFileSync('api/create-order.js','utf8');
const captureOrder=fs.readFileSync('api/capture-order.js','utf8');
const read=p=>fs.readFileSync(p,'utf8');

for(const id of ['us_body_butter_100','us_face_balm_100','us_hand_foot_balm_100','us_refill_body_butter_100','us_refill_face_balm_50','us_refill_hand_foot_balm_50','us_solid_perfume_ivory_hour','us_solid_perfume_veiled','us_solid_perfume_black_honey','us_solid_perfume_sacred_smoke','us_soap_exfoliating','us_soap_herbal','us_soap_flower','us_soap_fruit']){
  if(!defs.includes(id)) throw new Error('Studio care product missing: '+id);
}
if(/us_perfume_oil_rollon|Perfume Oil Roll-On/.test(defs)) throw new Error('roll-on perfume must stay removed from Studio USA');
if(!defs.includes('Net Wt. 0.18 oz / 5 g')||!defs.includes('Net Wt. 0.35 oz / 10 g')) throw new Error('solid perfume weight sizes missing');

for(const asset of ['solid-perfume-ivory-hour.svg','solid-perfume-veiled.svg','solid-perfume-black-honey.svg','solid-perfume-sacred-smoke.svg']){
  if(!defs.includes(asset)) throw new Error('solid perfume image mapping missing: '+asset);
}
if(!styles.includes('assets/velvet-charms-usa-hero.jpg')) throw new Error('approved USA hero is not wired into storefront CSS');
for(const token of ['--plum:#3b1230','--mauve:#7a3f68','--rose:#e2a9c4']) if(!brand.includes(token)) throw new Error('approved berry/rose palette token missing: '+token);

for(const token of ['ART_COMMIT = "a29437db52068129f0c5db9e7a6aa41de96fa929"','BODY_COMMIT = "543bad871521bc1dace35cdf5d02b0f6aa2de279"','BODY_TEXTILE_CATEGORY = "Knitted & Braided Wool Creations"']){
  if(!source.includes(token)) throw new Error('full catalogue source architecture missing: '+token);
}
if(!source.includes('for(const category of art.categories||[])')) throw new Error('complete Art & Gifts catalogue is not being loaded');
if(!source.includes('decorateTextileCategory')) throw new Error('Body Glow textiles are not being loaded');
if(!source.includes('ART_INQUIRY_IDS')) throw new Error('special Art & Gifts inquiry gate missing');
if(!source.includes('ART_US_PRICE')||!source.includes('TEXTILE_US_PRICE')) throw new Error('explicit USA pricing maps missing');
if(!source.includes('customerDescription')) throw new Error('customer-facing imported-product description layer missing');
if(!source.includes('__made_to_order')) throw new Error('made-to-order catalogue classification missing');
if(source.includes('us_perfume_oil_rollon')) throw new Error('roll-on mapping survived in catalogue source');
if(source.includes('common.scent=["Unscented"]')) throw new Error('fake one-choice scent selector survived');

for(const page of ['index.html','catalogue.html','faq.html','contact.html','legal.html','classics.html','scent.html','life-chapters.html']){
  const body=read(page);
  for(const pattern of [/\bUSA V1\b/i,/\bV1\b/i,/pre-?launch/i,/STORE_LIVE/i,/documentation pending/i,/launch gates?/i,/source snapshot/i]){
    if(pattern.test(body)) throw new Error('internal project language leaked into '+page+': '+pattern);
  }
}
if(!read('catalogue.html').includes('Art & Gifts')||!read('catalogue.html').includes('Textiles & Comfort')||!read('catalogue.html').includes('Body Care')) throw new Error('customer catalogue filters missing');
if(!read('index.html').includes('Things made to be kept, gifted and remembered.')) throw new Error('full Studio customer proposition missing');
if(!read('faq.html').includes('currently listed in the Studio are unscented')) throw new Error('unscented body-care customer explanation missing');
if(!read('life-chapters.html').includes('Looking for custom wedding pieces, example photos, or a personalized quote?')) throw new Error('wedding example-photo / quote CTA missing');

if(!studio.includes('64 pieces') && !studio.includes('state.meta.size')) throw new Error('catalogue customer count is not dynamic');
if(studio.includes('USA V1')||studio.includes('Documentation pending')||studio.includes('source-note')) throw new Error('internal catalogue language survived in browser UI');
if(!studio.includes('Custom inquiry')||!studio.includes('Coming soon')||!studio.includes('Made to order')) throw new Error('customer-facing product statuses missing');
if(!studio.includes('variantSummary')) throw new Error('visible fragrance size summary missing');
if(!studio.includes("e.key!=='Escape'")) throw new Error('Escape handling missing');
if(!studio.includes("document.body.classList.add('cart-open')")) throw new Error('cart drawer interaction missing');

for(const api of [createOrder,captureOrder]){
  if(!api.includes('STORE_LIVE')) throw new Error('server payment launch gate missing');
}
if(/PAYPAL_CLIENT_SECRET\s*=\s*["'][^"']+["']/.test(createOrder+captureOrder)) throw new Error('PayPal secret hardcoded');

const readme=read('README.md');
if(!readme.includes('Do not collapse Studio USA back to a small body-care-only catalogue.')) throw new Error('regression-prevention catalogue rule missing');
if(!readme.includes('There is **no Perfume Oil Roll-On product')) throw new Error('roll-on regression-prevention rule missing');
if(!readme.includes('must not be modified by Studio work')) throw new Error('source-repository isolation rule missing');

console.log('Velvet Charms Studio USA full-catalogue integrity contract PASS');
const cataloguePage=read('catalogue.html');
if(!cataloguePage.includes('id="catalogue-search"')) throw new Error('catalogue search control missing');
if(!cataloguePage.includes('id="catalogue-sort"')) throw new Error('catalogue sort control missing');
if(!studio.includes('matchesSearch')||!studio.includes('sortItems')) throw new Error('catalogue search/sort behavior missing');
if(!source.includes('CATEGORY_INTRO')) throw new Error('curated category introductions missing');
if(!source.includes('USA_PRICE_MISSING')) throw new Error('imported products can still fall back to non-USA prices');
if(!read('USA_IMPORTED_CATALOGUE_PRICING.md').includes('does **not** convert the European list price mechanically into USD')) throw new Error('USA imported-pricing guardrail missing');
