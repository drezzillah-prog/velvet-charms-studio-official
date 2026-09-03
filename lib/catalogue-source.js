export const STUDIO_CURRENCY = "EUR";
export const BODY_SELLABLE_CATEGORY = "Knitted & Braided Wool Creations";
export const BODY_PREVIEW_CATEGORY = "Candles";
export const ART_EXCLUDED_CATEGORIES = new Set(["Bundles"]);
export const ART_EXCLUDED_PRODUCT_IDS = new Set(["epoxy_lamp", "wall_clock_large"]);

const ART_COMMIT = "a29437db52068129f0c5db9e7a6aa41de96fa929";
const BODY_COMMIT = "543bad871521bc1dace35cdf5d02b0f6aa2de279";
const ART_CATALOGUE = `https://raw.githubusercontent.com/drezzillah-prog/velvet-charms-art-gifts-official/${ART_COMMIT}/catalogue-art-gifts.json`;
const ART_PRICING = `https://raw.githubusercontent.com/drezzillah-prog/velvet-charms-art-gifts-official/${ART_COMMIT}/pricing-ro.json`;
const BODY_CATALOGUE = `https://raw.githubusercontent.com/drezzillah-prog/velvet-charms-body-glow-official/${BODY_COMMIT}/catalogue-body-glow.json`;
const ART_ASSETS = `https://raw.githubusercontent.com/drezzillah-prog/velvet-charms-art-gifts-official/${ART_COMMIT}/`;
const BODY_ASSETS = `https://raw.githubusercontent.com/drezzillah-prog/velvet-charms-body-glow-official/${BODY_COMMIT}/`;

let sourceCache = null;
let sourceCacheAt = 0;
let productCache = null;
const CACHE_MS = 15 * 60 * 1000;

function flatten(category) {
  return [...(category.products || []), ...(category.subcategories || []).flatMap(sub => sub.products || [])];
}

async function loadJson(url) {
  const response = await fetch(url, { headers: { "User-Agent": "Velvet-Charms-Studio" } });
  if (!response.ok) throw new Error("SOURCE_UNAVAILABLE");
  return response.json();
}

async function sourceData() {
  if (sourceCache && Date.now() - sourceCacheAt < CACHE_MS) return sourceCache;
  const [art, artPricing, body] = await Promise.all([loadJson(ART_CATALOGUE), loadJson(ART_PRICING), loadJson(BODY_CATALOGUE)]);
  sourceCache = { art, artPricing, body };
  sourceCacheAt = Date.now();
  productCache = null;
  return sourceCache;
}

function euroPrice(product, source, market) {
  const ron = Number(product.price_ro);
  const base = Number(product.price);
  if (market === "RO" && Number.isFinite(ron)) return Number((ron / 5).toFixed(2));
  if (source === "art" && Number.isFinite(base)) return Number(base.toFixed(2));
  if (source === "body" && Number.isFinite(ron)) return Number((ron / 5).toFixed(2));
  if (Number.isFinite(base)) return Number(base.toFixed(2));
  throw new Error("INVALID_PRICE");
}

function withArtPricing(product, artPricing) {
  const ron = Number(artPricing?.[product.id]);
  return { ...product, price_ro: Number.isFinite(ron) ? ron : Number(product.price_ro) };
}

function filterArtCategory(category, artPricing) {
  if (ART_EXCLUDED_CATEGORIES.has(category.name)) return null;
  const copy = { ...category };
  if (Array.isArray(category.products)) {
    copy.products = category.products.filter(product => !ART_EXCLUDED_PRODUCT_IDS.has(product.id)).map(product => withArtPricing(product, artPricing));
  }
  if (Array.isArray(category.subcategories)) {
    copy.subcategories = category.subcategories.map(sub => ({
      ...sub,
      products: (sub.products || []).filter(product => !ART_EXCLUDED_PRODUCT_IDS.has(product.id)).map(product => withArtPricing(product, artPricing))
    })).filter(sub => sub.products.length);
  }
  return copy;
}

export async function publicCatalogue() {
  const { art, artPricing, body } = await sourceData();
  const sections = [];
  for (const category of art.categories || []) {
    const filtered = filterArtCategory(category, artPricing);
    if (filtered && flatten(filtered).length) sections.push({ kind: "art", source: "art", assetBase: ART_ASSETS, category: filtered });
  }
  const wool = (body.categories || []).find(category => category.name === BODY_SELLABLE_CATEGORY);
  if (wool) sections.push({ kind: "textiles", source: "body", assetBase: BODY_ASSETS, category: wool });
  const candles = (body.categories || []).find(category => category.name === BODY_PREVIEW_CATEGORY);
  if (candles) sections.push({ kind: "preview", source: "body", assetBase: BODY_ASSETS, category: candles });
  return {
    currency: STUDIO_CURRENCY,
    sourceMode: "immutable-pinned",
    sourceCommits: { art: ART_COMMIT, body: BODY_COMMIT },
    sections
  };
}

export async function studioCatalogue() {
  if (productCache && Date.now() - sourceCacheAt < CACHE_MS) return productCache;
  const { art, artPricing, body } = await sourceData();
  const products = new Map();

  for (const category of art.categories || []) {
    if (ART_EXCLUDED_CATEGORIES.has(category.name)) continue;
    for (const product of flatten(category)) {
      if (ART_EXCLUDED_PRODUCT_IDS.has(product.id)) continue;
      products.set(`art:${product.id}`, { ...withArtPricing(product, artPricing), __source: "art" });
    }
  }

  const wool = (body.categories || []).find(category => category.name === BODY_SELLABLE_CATEGORY);
  if (wool) for (const product of flatten(wool)) products.set(`body:${product.id}`, { ...product, __source: "body" });

  productCache = products;
  return products;
}

function cleanOptions(product, rawOptions) {
  const options = {};
  const incoming = rawOptions && typeof rawOptions === "object" ? rawOptions : {};
  for (const [key, rawValue] of Object.entries(incoming)) {
    const value = String(rawValue || "").trim().slice(0, 1000);
    if (!value) continue;
    if (key === "special_instructions") { options[key] = value; continue; }
    const allowed = product.options?.[key];
    if (!Array.isArray(allowed) || !allowed.includes(value)) throw new Error("INVALID_CUSTOMIZATION");
    options[key] = value;
  }
  return options;
}

export async function validateCart(rawCart, market) {
  const rawItems = rawCart?.items;
  if (!Array.isArray(rawItems) || rawItems.length < 1 || rawItems.length > 50) throw new Error("INVALID_CART");
  const catalogue = await studioCatalogue();
  return rawItems.map(raw => {
    const key = String(raw?.key || "");
    const product = catalogue.get(key);
    const quantity = Number.parseInt(raw?.qty, 10);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error("INVALID_CART");
    return {
      key,
      id: String(product.id),
      source: product.__source,
      name: String(product.name).slice(0, 127),
      quantity,
      price: euroPrice(product, product.__source, market),
      options: cleanOptions(product, raw?.options)
    };
  });
}

export function marketFromRequest(req) {
  const country = String(req.headers["x-vercel-ip-country"] || "").toUpperCase();
  const timezone = String(req.headers["x-vercel-ip-timezone"] || "");
  return country === "RO" || (!country && timezone === "Europe/Bucharest") ? "RO" : "INTL";
}
