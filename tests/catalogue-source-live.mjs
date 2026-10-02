import fs from 'node:fs';
import { publicCatalogue, studioCatalogue, STUDIO_CURRENCY, STUDIO_MARKET, validateCart } from '../lib/catalogue-source.js';

const payload=await publicCatalogue();
if(STUDIO_CURRENCY!=='USD'||payload.currency!=='USD') throw new Error('Studio USA must use USD');
if(STUDIO_MARKET!=='US'||payload.market!=='US') throw new Error('Studio USA market gate missing');
if('sourceCommits' in payload||'sourceMode' in payload) throw new Error('internal source metadata leaked into public catalogue');

const flatten=c=>[...(c.products||[]),...(c.subcategories||[]).flatMap(s=>s.products||[])];
const products=payload.sections.flatMap(s=>flatten(s.category));
if(products.length!==64) throw new Error(`full Studio catalogue should contain 64 pieces, found ${products.length}`);

for(const p of products){
  const customerText=[p.name,p.size,p.description,...Object.values(p.options||{}).flat()].filter(Boolean).join(' ');
  for(const pattern of [/\bV1\b/i,/pre-?launch/i,/STORE_LIVE/i,/supplier/i,/formula/i,/prototype/i,/documentation pending/i,/source snapshot/i,/repository/i,/launch gates?/i]){
    if(pattern.test(customerText)) throw new Error('internal wording leaked into customer product: '+p.id+' -> '+pattern);
  }
  for(const key of Object.keys(p)){
    if(key.startsWith('__')) throw new Error('internal product field leaked publicly: '+p.id+' -> '+key);
  }
  for(const key of ['formula','formulaCode','formulaVersion','formulaBatchBasis']){
    if(key in p) throw new Error('formula metadata leaked publicly: '+p.id+' -> '+key);
  }
  if(!['standard','made-to-order','custom-inquiry','coming-soon'].includes(p.availability)) throw new Error('invalid customer availability state: '+p.id);
  if(!Array.isArray(p.tags)||!p.tags.length) throw new Error('shopping tags missing: '+p.id);
}

for(const category of ['Paintings & Portraits','Hair Accessories','Epoxy & Clay Creations','Leather Bags','Wall Clock','Bundles','Textiles & Comfort','Body Butter','Nourishing Face Balm','Hand & Foot Balm','Refills','Velvet Fragrance','Glycerin Soap']){
  const section=payload.sections.find(s=>s.category?.name===category);
  if(!section) throw new Error('catalogue section missing: '+category);
  if(!String(section.category?.customer_intro||'').trim()) throw new Error('customer intro missing: '+category);
}

if(products.some(p=>p.id==='us_perfume_oil_rollon'||/roll-?on/i.test(p.name||''))) throw new Error('roll-on perfume returned to Studio catalogue');

for(const id of ['us_body_butter_100','us_face_balm_100','us_hand_foot_balm_100','us_refill_body_butter_100','us_refill_face_balm_50','us_refill_hand_foot_balm_50']){
  const p=products.find(x=>x.id===id);
  if(!p) throw new Error('unscented care product missing: '+id);
  if(p.options?.scent) throw new Error('unscented care product exposes a scent selector: '+id);
  if(!/^Unscented\./.test(p.description||'')) throw new Error('unscented care copy missing: '+id);
}

for(const id of ['us_solid_perfume_ivory_hour','us_solid_perfume_veiled','us_solid_perfume_black_honey','us_solid_perfume_sacred_smoke']){
  const p=products.find(x=>x.id===id);
  if(!p) throw new Error('solid perfume missing: '+id);
  if(!Array.isArray(p.options?.size)||p.options.size.length!==2) throw new Error('solid perfume size selector missing: '+id);
  if(!Array.isArray(p.images)||!p.images[0]?.startsWith('/assets/solid-perfume-')) throw new Error('Studio-owned solid perfume image missing: '+id);
  if(!fs.existsSync('.'+p.images[0])) throw new Error('local solid perfume asset not found: '+p.images[0]);
  if(p.availability!=='coming-soon') throw new Error('solid perfume customer availability changed unexpectedly: '+id);
}

const expectedUsPrices={
  landscape_small:69,landscape_medium:119,landscape_large:199,
  portrait_2d:169,portrait_3d:249,portrait_family:319,portrait_mini:69,
  hair_clip:29,hair_custom:79,tray:79,jewelry_box:89,
  leather_bag_small:159,leather_bag_medium:229,leather_bag_large:299,
  beanie_small:59,scarf_standard:99,winter_set:229,blanket_small:219,blanket_large:589,felt_family:219,pet_beanie:39
};
for(const [id,price] of Object.entries(expectedUsPrices)){
  const p=products.find(x=>x.id===id);
  if(!p||Number(p.price)!==price) throw new Error(`USA positioning price mismatch: ${id} -> ${p?.price} expected ${price}`);
}

const serverMap=await studioCatalogue();
if(serverMap.size!==64) throw new Error(`public/server catalogue counts diverge: ${serverMap.size}/64`);
const serverProducts=[...serverMap.values()];
const art=serverProducts.filter(p=>p.__source==='art');
const textiles=serverProducts.filter(p=>p.__source==='body');
const studio=serverProducts.filter(p=>p.__source==='studio');
if(art.length!==33) throw new Error(`complete Art & Gifts snapshot missing: ${art.length}/33`);
if(textiles.length!==17) throw new Error(`Body Glow textiles missing: ${textiles.length}/17`);
if(studio.length!==14) throw new Error(`Studio care/fragrance/soap subset changed unexpectedly: ${studio.length}/14`);

for(const p of [...art.filter(x=>!x.__inquiry_only),...textiles]){
  const pub=products.find(x=>x.id===p.id);
  if(!pub||pub.availability!=='made-to-order') throw new Error('handmade piece lost made-to-order status: '+p.id);
  if(String(pub.description||'').length<70) throw new Error('handmade product description is too thin: '+p.id);
}

for(const id of ['epoxy_lamp','wall_clock_large','relax_restore','cozy_winter','home_harmony']){
  const p=products.find(x=>x.id===id);
  if(!p||p.availability!=='custom-inquiry') throw new Error('custom-inquiry product missing or ungated: '+id);
}

const ready=products.find(p=>p.availability==='standard'||p.availability==='made-to-order');
if(!ready) throw new Error('no standard catalogue product available for cart validation');
await validateCart({items:[{key:`studio:${ready.id}`,qty:1,options:{}}]},'US');

let nonUsBlocked=false;
try{await validateCart({items:[{key:`studio:${ready.id}`,qty:1,options:{}}]},'NON_US')}catch(e){nonUsBlocked=e.message==='UNSUPPORTED_MARKET'}
if(!nonUsBlocked) throw new Error('non-US cart was not blocked');

const gated=products.find(p=>p.availability==='custom-inquiry'||p.availability==='coming-soon');
let gatedBlocked=false;
try{await validateCart({items:[{key:`studio:${gated.id}`,qty:1,options:{}}]},'US')}catch(e){gatedBlocked=e.message==='PRODUCT_NOT_READY'}
if(!gatedBlocked) throw new Error('custom-inquiry/coming-soon product entered checkout');

if(!products.every(p=>Number.isFinite(Number(p.price))&&Number(p.price)>0)) throw new Error('catalogue product missing USD price');
if(!products.every(p=>Array.isArray(p.images)&&p.images.length>0)) throw new Error('catalogue product missing image');

console.log('Velvet Charms Studio USA catalogue PASS — 64 customer pieces; internal formula/source metadata withheld from public API');

for(const id of ['portrait_2d','tray','blanket_medium','felt_family']){
  const p=products.find(x=>x.id===id);
  if(!p?.tags?.includes('gift')) throw new Error('gift discovery tag missing: '+id);
}
if(!products.find(x=>x.id==='pet_beanie')?.tags?.includes('pet')) throw new Error('pet discovery tag missing');
if(!products.find(x=>x.id==='leather_bag_small')?.tags?.includes('wearable')) throw new Error('wearable discovery tag missing');
