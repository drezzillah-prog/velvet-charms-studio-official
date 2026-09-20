import { publicCatalogue, studioCatalogue, STUDIO_CURRENCY, STUDIO_MARKET, validateCart } from '../lib/catalogue-source.js';

const payload = await publicCatalogue();
if (payload.sourceMode !== 'studio-owned-us-v1-with-pinned-asset-source') throw new Error('Studio-owned USA V1 source mode missing');
if (payload.sourceCommits.bodyAssets !== '543bad871521bc1dace35cdf5d02b0f6aa2de279') throw new Error('Body Glow immutable asset/source pin changed');
if (STUDIO_CURRENCY !== 'USD' || payload.currency !== 'USD') throw new Error('USA Studio must use USD');
if (STUDIO_MARKET !== 'US' || payload.market !== 'US') throw new Error('USA Studio market gate missing');
if (!payload.sections.length || payload.sections.some(s => s.source !== 'studio' || s.kind !== 'us-v1')) throw new Error('non-Studio USA V1 source entered catalogue');

const flatten = c => [...(c.products || []), ...(c.subcategories || []).flatMap(s => s.products || [])];
const products = payload.sections.flatMap(s => flatten(s.category));
const requiredFamilies = ['Body Butter','Face Balm','Hand & Foot Balm','Refills','Solid Perfume','Perfume Oil Roll-On','Glycerin Soap'];
for (const family of requiredFamilies) if (!products.some(p => p.studio_family === family)) throw new Error(`missing USA V1 family: ${family}`);
if (products.some(p => ['face_cream','hand_foot_cream'].includes(p.id))) throw new Error('legacy water-cream SKU leaked into Studio');
if (!products.every(p => p.id.startsWith('us_') && p.__source === 'studio' && p.__launch_status === 'prelaunch')) throw new Error('Studio V1 metadata contract broken');
if (!products.every(p => Number.isFinite(Number(p.price)) && Number(p.price) > 0)) throw new Error('USA V1 product missing server price');
if (!products.every(p => Array.isArray(p.images) && p.images.length > 0)) throw new Error('USA V1 product missing pinned source image');
if (products.length !== 17) throw new Error(`USA V1 product count changed unexpectedly: ${products.length}`);
const expectedIds=['us_body_butter_100','us_face_balm_100','us_hand_foot_balm_100','us_refill_body_butter_100','us_refill_face_balm_50','us_refill_hand_foot_balm_50','us_solid_perfume_vanilla_orchid','us_solid_perfume_amber_wood','us_solid_perfume_sandalwood_rose','us_solid_perfume_white_musk','us_rollon_lavender_mist','us_rollon_cedar_amber','us_rollon_floral_spice','us_soap_exfoliating','us_soap_herbal','us_soap_flower','us_soap_fruit'];
for(const id of expectedIds) if(!products.some(p=>p.id===id)) throw new Error(`required USA V1 product missing: ${id}`);
if(products.filter(p=>p.__fragrance_gate).length!==7) throw new Error('USA fragrance gate count changed');
if(products.filter(p=>p.__supplier_formula_gate).length!==4) throw new Error('USA supplier-formula gate count changed');
const butter=products.find(p=>p.id==='us_body_butter_100');
if(JSON.stringify(butter?.options?.scent)!==JSON.stringify(['Unscented'])) throw new Error('Body Butter must not inherit unsupported legacy scent variants');
for(const p of products.filter(p=>p.id.startsWith('us_refill_'))) if(p.options?.scent||p.options?.vessel_preference) throw new Error(`refill inherited incompatible legacy options: ${p.id}`);
for(const p of products.filter(p=>p.id.startsWith('us_solid_perfume_')||p.id.startsWith('us_rollon_'))) if(p.options?.scent) throw new Error(`formula-specific fragrance product inherited generic scent selector: ${p.id}`);
for(const p of products.filter(p=>p.id.startsWith('us_soap_'))) if(p.options?.aroma) throw new Error(`supplier-gated soap inherited unfrozen aroma selector: ${p.id}`);

const serverMap = await studioCatalogue();
if (serverMap.size !== products.length) throw new Error(`public/server counts diverge: public=${products.length}, server=${serverMap.size}`);
for (const [key, product] of serverMap) if (!key.startsWith('studio:') || product.__source !== 'studio') throw new Error(`source mismatch for ${key}`);

const ready = products.find(p => !p.__supplier_formula_gate);
if (!ready) throw new Error('no checkout-testable V1 product');
await validateCart({items:[{key:`studio:${ready.id}`,qty:1,options:{}}]}, 'US');
let blockedNonUS = false;
try { await validateCart({items:[{key:`studio:${ready.id}`,qty:1,options:{}}]}, 'NON_US'); } catch (e) { blockedNonUS = e.message === 'UNSUPPORTED_MARKET'; }
if (!blockedNonUS) throw new Error('non-US cart was not blocked');
const gatedSoap = products.find(p => p.__supplier_formula_gate);
if (gatedSoap) {
  let blockedSoap = false;
  try { await validateCart({items:[{key:`studio:${gatedSoap.id}`,qty:1,options:{}}]}, 'US'); } catch (e) { blockedSoap = e.message === 'PRODUCT_NOT_READY'; }
  if (!blockedSoap) throw new Error('supplier-dependent soap entered checkout');
}
console.log(`Velvet Charms Studio USA V1 catalogue PASS — ${serverMap.size} Studio-owned prelaunch products in USD`);


// Every USA V1 image must resolve from the immutable pinned Body Glow asset source.
for(const section of payload.sections){
  for(const product of section.category.products||[]){
    for(const file of product.images||[]){
      const response=await fetch(section.assetBase+file.split('/').map(encodeURIComponent).join('/'),{method:'HEAD'});
      if(!response.ok) throw new Error(`Missing pinned source image: ${product.id} -> ${file}`);
    }
  }
}
