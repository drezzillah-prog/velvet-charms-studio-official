import { US_V1_PRODUCTS, assertFormulaTotals } from "../data/us-v1-products.js";

export const STUDIO_CURRENCY = "USD";
export const STUDIO_MARKET = "US";

const BODY_COMMIT = "543bad871521bc1dace35cdf5d02b0f6aa2de279";
const BODY_CATALOGUE = `https://raw.githubusercontent.com/drezzillah-prog/velvet-charms-body-glow-official/${BODY_COMMIT}/catalogue-body-glow.json`;
const BODY_ASSETS = `https://raw.githubusercontent.com/drezzillah-prog/velvet-charms-body-glow-official/${BODY_COMMIT}/`;

// Studio owns the USA formulas. Body Glow remains an immutable source only for
// reusable catalogue metadata/assets and products that are genuinely the same format.
const SOURCE_REUSE = new Map([
  ["us_body_butter_100", "body_butter_100"],
  ["us_solid_perfume", "solid_perfume"],
  ["us_perfume_rollon", "perfume_rollon"],
  ["us_soap_exfoliating", "soap_exfoliating"],
  ["us_soap_moisturizing", "soap_moisturizing"],
  ["us_soap_herbal", "soap_herbal"]
]);

const STUDIO_PRICE_SOURCE = new Map([
  ["us_body_butter_100", "body_butter_100"],
  ["us_face_balm_100", "face_cream"],
  ["us_hand_foot_balm_100", "hand_foot_cream"],
  ["us_solid_perfume", "solid_perfume"],
  ["us_perfume_rollon", "perfume_rollon"],
  ["us_soap_exfoliating", "soap_exfoliating"],
  ["us_soap_moisturizing", "soap_moisturizing"],
  ["us_soap_herbal", "soap_herbal"]
]);

let sourceCache = null;
let sourceCacheAt = 0;
let productCache = null;
const CACHE_MS = 15 * 60 * 1000;

function flatten(category) {
  return [...(category.products || []), ...(category.subcategories || []).flatMap(sub => sub.products || [])];
}
async function loadJson(url) {
  const response = await fetch(url, { headers: { "User-Agent": "Velvet-Charms-Studio-US" } });
  if (!response.ok) throw new Error("SOURCE_UNAVAILABLE");
  return response.json();
}
async function sourceData() {
  if (sourceCache && Date.now() - sourceCacheAt < CACHE_MS) return sourceCache;
  const body = await loadJson(BODY_CATALOGUE);
  sourceCache = { body };
  sourceCacheAt = Date.now();
  productCache = null;
  return sourceCache;
}
function sourceProducts(body) { return (body.categories || []).flatMap(flatten); }
function usdPrice(product) {
  const base = Number(product?.price);
  if (!Number.isFinite(base) || base <= 0) throw new Error("INVALID_PRICE");
  return Number(base.toFixed(2));
}
function byId(body) { return new Map(sourceProducts(body).map(product => [product.id, product])); }

function studioFormulaProduct(definition, sourceIndex) {
  const priceSource = sourceIndex.get(STUDIO_PRICE_SOURCE.get(definition.id));
  if (!priceSource) throw new Error(`SOURCE_PRODUCT_MISSING:${definition.id}`);
  const reusable = SOURCE_REUSE.has(definition.id) ? sourceIndex.get(SOURCE_REUSE.get(definition.id)) : null;
  return {
    ...(reusable || {}),
    id: definition.id,
    name: definition.name,
    size: definition.size,
    studio_family: definition.family,
    formulaCode: definition.formulaCode,
    formulaVersion: definition.version,
    formula: definition.formula,
    description: definition.positioning,
    price: usdPrice(priceSource),
    __source: "studio",
    __source_reference: reusable?.id || null,
    __launch_status: definition.launchStatus
  };
}

export async function publicCatalogue() {
  assertFormulaTotals();
  const { body } = await sourceData();
  const sourceIndex = byId(body);
  const products = US_V1_PRODUCTS.map(definition => studioFormulaProduct(definition, sourceIndex));
  const grouped = new Map();
  for (const product of products) {
    if (!grouped.has(product.studio_family)) grouped.set(product.studio_family, []);
    grouped.get(product.studio_family).push(product);
  }
  const sections = [...grouped.entries()].map(([name, familyProducts]) => ({
    kind: "us-v1",
    source: "studio",
    assetBase: BODY_ASSETS,
    category: { id: `us-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, name, products: familyProducts }
  }));
  return {
    currency: STUDIO_CURRENCY,
    market: STUDIO_MARKET,
    sourceMode: "studio-owned-us-v1-with-pinned-asset-source",
    sourceCommits: { bodyAssets: BODY_COMMIT },
    checkoutGate: "STORE_LIVE",
    sections
  };
}

export async function studioCatalogue() {
  if (productCache && Date.now() - sourceCacheAt < CACHE_MS) return productCache;
  const payload = await publicCatalogue();
  const products = new Map();
  for (const section of payload.sections) for (const product of flatten(section.category)) products.set(`studio:${product.id}`, product);
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
  if (market !== "US") throw new Error("UNSUPPORTED_MARKET");
  const rawItems = rawCart?.items;
  if (!Array.isArray(rawItems) || rawItems.length < 1 || rawItems.length > 50) throw new Error("INVALID_CART");
  const catalogue = await studioCatalogue();
  return rawItems.map(raw => {
    const key = String(raw?.key || "");
    const product = catalogue.get(key);
    const quantity = Number.parseInt(raw?.qty, 10);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error("INVALID_CART");
    return { key, id: String(product.id), source: product.__source, name: String(product.name).slice(0,127), quantity, price: usdPrice(product), options: cleanOptions(product, raw?.options) };
  });
}

export function marketFromRequest(req) {
  const country = String(req.headers["x-vercel-ip-country"] || "").toUpperCase();
  return country === "US" ? "US" : "NON_US";
}
