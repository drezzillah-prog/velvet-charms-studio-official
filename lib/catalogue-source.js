import { US_V1_PRODUCTS, assertFormulaTotals } from "../data/us-v1-products.js";

export const STUDIO_CURRENCY = "USD";
export const STUDIO_MARKET = "US";

const ART_COMMIT = "a29437db52068129f0c5db9e7a6aa41de96fa929";
const BODY_COMMIT = "543bad871521bc1dace35cdf5d02b0f6aa2de279";
const ART_CATALOGUE = `https://raw.githubusercontent.com/drezzillah-prog/velvet-charms-art-gifts-official/${ART_COMMIT}/catalogue-art-gifts.json`;
const BODY_CATALOGUE = `https://raw.githubusercontent.com/drezzillah-prog/velvet-charms-body-glow-official/${BODY_COMMIT}/catalogue-body-glow.json`;
const ART_ASSETS = `https://raw.githubusercontent.com/drezzillah-prog/velvet-charms-art-gifts-official/${ART_COMMIT}/`;
const BODY_ASSETS = `https://raw.githubusercontent.com/drezzillah-prog/velvet-charms-body-glow-official/${BODY_COMMIT}/`;

const BODY_TEXTILE_CATEGORY = "Knitted & Braided Wool Creations";
const ART_INQUIRY_IDS = new Set(["epoxy_lamp","wall_clock_large"]);
const GENERIC_OPTION_KEYS = ["hidden_message","ritual_card","collectible_charm","velvet_passport","vessel_preference"];
const US_RETAIL_PRICE = {
  body_butter_100:28, face_cream:32, hand_foot_cream:26,
  refill_body_butter:22, refill_face_cream:25, refill_hand_foot:21,
  solid_perfume:32, soap_exfoliating:14, soap_herbal:14, soap_flower:16, soap_fruit:16
};

const ART_US_PRICE = {
  landscape_small:69, landscape_medium:119, landscape_large:199,
  portrait_2d:169, portrait_3d:249, portrait_family:319, portrait_mini:69,
  holiday_2d:179, holiday_3d:269,
  hair_clip:29, hair_pins_set:34, hair_combs_set:39, hair_custom:79,
  coasters:49, tray:79, figurine_small:45, figurine_medium:69, figurine_large:109,
  epoxy_lamp:169, holder_set:65, keychains_custom:29, epoxy_pendant:39,
  epoxy_earrings:36, epoxy_ring:34, jewelry_box:89, epoxy_case:89,
  leather_bag_small:159, leather_bag_medium:229, leather_bag_large:299,
  wall_clock_large:169, relax_restore:99, cozy_winter:199, home_harmony:149
};

const DISPLAY_NAME = {
  hair_combs_set:"Decorative Hair Combs"
};

const CATEGORY_INTRO = {
  "Paintings & Portraits":"Original paintings and portrait commissions made from your references, preferred palette and chosen level of detail — from small keepsakes to statement pieces.",
  "Hair Accessories":"Handmade clips, pins, combs and matching sets in resin and mixed media, customized by palette, metal tone and finish.",
  "Epoxy & Clay Creations":"Functional and decorative objects made in resin, clay, wood and mixed media — trays, figurines, jewelry, cases and keepsakes with customizable finishes and inclusions.",
  "Leather Bags":"Handcrafted leather bags in three sizes, with your choice of leather color, hardware and optional personalization.",
  "Wall Clock":"A large epoxy-and-wood wall clock created as a custom home piece, with the palette, markers and finish agreed with you before production.",
  "Bundles":"Curated gift concepts prepared by custom inquiry so the contents, substitutions, presentation and final quote fit the recipient and occasion.",
  "Textiles & Comfort":"Hand-knitted and felted pieces for people, homes and pets — warm accessories, braided blankets and small animal keepsakes made individually.",
  "Body Butter":"Unscented, water-free body care with a rich balm-butter texture for everyday moisturizing and conditioning.",
  "Nourishing Face Balm":"A concentrated, unscented water-free face balm with a simple formula and cushiony finish.",
  "Hand & Foot Balm":"An unscented rich balm for hands and feet, designed for everyday softening and conditioning.",
  "Refills":"Lower-waste refill formats using the same master formulas as their matching Velvet body-care products.",
  "Velvet Fragrance":"Four portable solid perfumes — IVORY HOUR, VEILED, BLACK HONEY and SACRED SMOKE — each with its own mood and story.",
  "Glycerin Soap":"Giftable glycerin soaps in exfoliating, herbal and sculpted designs, presented as decorative cleansing bars."
};

const TEXTILE_US_PRICE = {
  beanie_small:59, beanie_medium:64, beanie_large:69, beanie_xl:74,
  scarf_standard:99, mittens_small:69, mittens_medium:74, mittens_large:79, mittens_xl:84,
  winter_set:229, blanket_small:219, blanket_medium:399, blanket_large:589,
  felt_small:49, felt_medium:85, felt_family:219, pet_beanie:39
};

let sourceCache=null, sourceCacheAt=0, productCache=null;
const CACHE_MS=15*60*1000;

function flatten(category){return [...(category.products||[]),...(category.subcategories||[]).flatMap(s=>s.products||[])]}
async function loadJson(url){const r=await fetch(url,{headers:{"User-Agent":"Velvet-Charms-Studio-US"}});if(!r.ok)throw Error("SOURCE_UNAVAILABLE");return r.json()}
async function sourceData(){
  if(sourceCache&&Date.now()-sourceCacheAt<CACHE_MS)return sourceCache;
  const [art,body]=await Promise.all([loadJson(ART_CATALOGUE),loadJson(BODY_CATALOGUE)]);
  sourceCache={art,body}; sourceCacheAt=Date.now(); productCache=null; return sourceCache;
}
function productIndex(body){return new Map((body.categories||[]).flatMap(flatten).map(p=>[p.id,p]))}
function safePrice(product){const p=Number(product?.price);if(!Number.isFinite(p)||p<=0)throw Error("INVALID_PRICE");return Number(p.toFixed(2))}
function mappedPrice(map,id){const p=Number(map[id]);if(!Number.isFinite(p)||p<=0)throw Error(`USA_PRICE_MISSING:${id}`);return Number(p.toFixed(2))}
function artUsPrice(product){return mappedPrice(ART_US_PRICE,product.id)}
function textileUsPrice(product){return mappedPrice(TEXTILE_US_PRICE,product.id)}

function customerDescription(product,categoryName){
  const base=String(product.description||"").trim().replace(/\s+/g," ");
  const id=String(product.id||"");
  if(categoryName==="Paintings & Portraits") return `${base} Choose the visual style, color palette and background treatment, then use special instructions for reference-photo details, people, pets or meaningful elements you want included.`;
  if(categoryName==="Hair Accessories") return `${base} Choose a color palette, metal tone and finish to coordinate the piece with an outfit, event or gift.`;
  if(categoryName==="Epoxy & Clay Creations"){
    if(id==="epoxy_lamp") return `${base} A statement custom piece available by inquiry so the finish, inclusions and practical details can be confirmed with you before a quote is prepared.`;
    return `${base} Choose the palette, finish and inclusions to make the piece more personal; botanical, metallic and keepsake-style details are available where suitable.`;
  }
  if(categoryName==="Leather Bags") return `${base} Choose the leather color, hardware and personalization details to create a practical handmade bag with a more individual finish.`;
  if(categoryName==="Wall Clock") return `${base} A custom home piece available by inquiry, with palette, number style and finish agreed before the final quote.`;
  if(categoryName==="Bundles") return `${base} A curated gift concept assembled by custom inquiry; the final contents, substitutions, presentation and quote are confirmed with you before production.`;
  if(categoryName==="Textiles & Comfort"){
    if(id.startsWith("beanie_")) return `${base} A hand-knitted cold-weather accessory made individually in the listed size; use special instructions for color preferences or a gift request.`;
    if(id.startsWith("mittens_")) return `${base} Hand-knitted mittens in the listed size, made individually for warmth, gifting and everyday winter wear.`;
    if(id==="scarf_standard") return `${base} A hand-knitted one-size scarf designed as a substantial winter accessory and giftable comfort piece.`;
    if(id==="winter_set") return `${base} A coordinated handmade beanie, scarf and mitten set for customers who want one consistent winter look rather than separate pieces.`;
    if(id.startsWith("blanket_")) return `${base} A chunky braided throw made as a tactile home piece in the listed dimensions, suited to sofas, reading corners and meaningful gifts.`;
    if(id==="felt_small"||id==="felt_medium") return `${base} A small hand-felted wool animal made as a decorative keepsake; tell us the animal, colors or reference details you would like considered.`;
    if(id==="felt_family") return `${base} A four-piece felted animal family created as a custom keepsake, with species, colors and family details discussed through special instructions.`;
    if(id==="pet_beanie") return `${base} A handmade pet accessory offered as a beanie, shirt or scarf; include the pet type and approximate measurements in special instructions so fit can be reviewed.`;
    return `${base} Handmade for comfort and gifting, with the listed size or set format shown in the product name.`;
  }
  return base;
}
function sourceIdFor(id){
  if(id==="us_body_butter_100")return"body_butter_100";
  if(id==="us_face_balm_100")return"face_cream";
  if(id==="us_hand_foot_balm_100")return"hand_foot_cream";
  if(id==="us_refill_body_butter_100")return"refill_body_butter";
  if(id==="us_refill_face_balm_50")return"refill_face_cream";
  if(id==="us_refill_hand_foot_balm_50")return"refill_hand_foot";
  if(id.startsWith("us_solid_perfume_"))return"solid_perfume";
  if(id==="us_soap_exfoliating")return"soap_exfoliating";
  if(id==="us_soap_herbal")return"soap_herbal";
  if(id==="us_soap_flower")return"soap_flower";
  if(id==="us_soap_fruit")return"soap_fruit";
  return null;
}
function usRetailPrice(sourceId,source){const p=Number(US_RETAIL_PRICE[sourceId]);return Number((Number.isFinite(p)&&p>0?p:safePrice(source)).toFixed(2))}
function genericOptions(source){
  const out={};
  for(const key of GENERIC_OPTION_KEYS) if(Array.isArray(source?.options?.[key])) out[key]=source.options[key];
  return out;
}
function optionsForStudio(d,source){
  const out=genericOptions(source);
  // Current water-free body-care formulas are unscented. No fake scent selector.
  if(d.id.startsWith("us_solid_perfume_")) out.size=Array.isArray(d.sizeOptions)?d.sizeOptions:[];
  return out;
}
function decorateArtProduct(product,categoryName){
  return {
    ...product,
    name:DISPLAY_NAME[product.id]||product.name,
    price:artUsPrice(product),
    description:customerDescription(product,categoryName),
    studio_family: categoryName==="Bundles" ? "Gift Sets" : "Art & Gifts",
    __source:"art",
    __launch_status:"catalogue",
    __made_to_order: categoryName!=="Bundles" && !ART_INQUIRY_IDS.has(product.id),
    __inquiry_only: ART_INQUIRY_IDS.has(product.id) || categoryName==="Bundles"
  };
}
function decorateArtCategory(category){
  return {
    ...category,
    customer_intro:CATEGORY_INTRO[category.name]||"",
    products:(category.products||[]).map(p=>decorateArtProduct(p,category.name)),
    subcategories:(category.subcategories||[]).map(sub=>({...sub,products:(sub.products||[]).map(p=>decorateArtProduct(p,category.name))}))
  };
}
function decorateTextileCategory(category){
  const decorate=p=>({...p,price:textileUsPrice(p),description:customerDescription(p,"Textiles & Comfort"),studio_family:"Textiles & Comfort",__source:"body",__launch_status:"catalogue",__made_to_order:true});
  return {
    ...category,
    name:"Textiles & Comfort",
    customer_intro:CATEGORY_INTRO["Textiles & Comfort"],
    products:(category.products||[]).map(decorate),
    subcategories:(category.subcategories||[]).map(sub=>({...sub,products:(sub.products||[]).map(decorate)}))
  };
}
function studioFormulaProduct(d,index){
  const sid=sourceIdFor(d.id), source=sid?index.get(sid):null;
  if(!source)throw Error(`SOURCE_PRODUCT_MISSING:${d.id}:${sid||"unmapped"}`);
  const group=d.family==="Velvet Fragrance"?"Velvet Fragrance":d.family==="Glycerin Soap"?"Glycerin Soap":"Body Care";
  return {
    ...source,
    options:optionsForStudio(d,source),
    id:d.id,
    name:d.name,
    size:d.size,
    formulaBatchBasis:d.formulaBatchBasis||null,
    studio_family:group,
    formulaCode:d.formulaCode,
    formulaVersion:d.version,
    formula:d.formula,
    description:d.positioning,
    images:Array.isArray(d.studioImages)&&d.studioImages.length?d.studioImages:(Array.isArray(source.images)?source.images:[]),
    price:usRetailPrice(sid,source),
    __source:"studio",
    __source_reference:sid,
    __launch_status:"catalogue",
    __fragrance_gate:Boolean(d.fragranceGate),
    __supplier_formula_gate:Boolean(d.supplierFormulaGate),
    __inquiry_only:Boolean(d.fragranceGate||d.supplierFormulaGate)
  };
}

export async function publicCatalogue(){
  assertFormulaTotals();
  const {art,body}=await sourceData(), index=productIndex(body), sections=[];
  for(const category of art.categories||[]){
    const decorated=decorateArtCategory(category);
    if(flatten(decorated).length) sections.push({kind:"art",source:"art",assetBase:ART_ASSETS,category:decorated});
  }
  const textiles=(body.categories||[]).find(c=>c.name===BODY_TEXTILE_CATEGORY);
  if(textiles) sections.push({kind:"textiles",source:"body",assetBase:BODY_ASSETS,category:decorateTextileCategory(textiles)});
  const studioProducts=US_V1_PRODUCTS.map(d=>studioFormulaProduct(d,index));
  const groups=new Map();
  for(const p of studioProducts){
    const sectionName=p.studio_family==="Body Care"
      ? (p.id.startsWith("us_refill_")?"Refills":p.__source_reference==="body_butter_100"?"Body Butter":p.__source_reference==="face_cream"?"Nourishing Face Balm":"Hand & Foot Balm")
      : p.studio_family;
    if(!groups.has(sectionName))groups.set(sectionName,[]);
    groups.get(sectionName).push(p);
  }
  for(const [name,products] of groups) sections.push({kind:"studio",source:"studio",assetBase:BODY_ASSETS,category:{id:`studio-${name.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`,name,customer_intro:CATEGORY_INTRO[name]||"",products}});
  return {currency:STUDIO_CURRENCY,market:STUDIO_MARKET,sourceMode:"curated-studio-us",sourceCommits:{art:ART_COMMIT,body:BODY_COMMIT},sections};
}

export async function studioCatalogue(){
  if(productCache&&Date.now()-sourceCacheAt<CACHE_MS)return productCache;
  const payload=await publicCatalogue(), map=new Map();
  for(const s of payload.sections) for(const p of flatten(s.category)) map.set(`studio:${p.id}`,p);
  productCache=map; return map;
}
function cleanOptions(product,rawOptions){
  const out={}, incoming=rawOptions&&typeof rawOptions==="object"?rawOptions:{};
  for(const [key,raw] of Object.entries(incoming)){
    const value=String(raw||"").trim().slice(0,1000); if(!value)continue;
    if(key==="special_instructions"){out[key]=value;continue}
    const allowed=product.options?.[key];
    if(!Array.isArray(allowed)||!allowed.includes(value))throw Error("INVALID_CUSTOMIZATION");
    out[key]=value;
  }
  return out;
}
export async function validateCart(rawCart,market){
  if(market!=="US")throw Error("UNSUPPORTED_MARKET");
  const rawItems=rawCart?.items;
  if(!Array.isArray(rawItems)||rawItems.length<1||rawItems.length>50)throw Error("INVALID_CART");
  const catalogue=await studioCatalogue();
  return rawItems.map(raw=>{
    const key=String(raw?.key||""), product=catalogue.get(key), quantity=Number.parseInt(raw?.qty,10);
    if(!product||!Number.isInteger(quantity)||quantity<1||quantity>20)throw Error("INVALID_CART");
    if(product.__inquiry_only||product.__supplier_formula_gate||product.__fragrance_gate)throw Error("PRODUCT_NOT_READY");
    return {key,id:String(product.id),source:product.__source,name:String(product.name).slice(0,127),quantity,price:safePrice(product),options:cleanOptions(product,raw?.options)};
  });
}
export function marketFromRequest(req){const country=String(req.headers["x-vercel-ip-country"]||"").toUpperCase();return country==="US"?"US":"NON_US"}
