export const STUDIO_CURRENCY = "USD";
export const STUDIO_MARKET = "US";

const BODY_COMMIT = "543bad871521bc1dace35cdf5d02b0f6aa2de279";
const BODY_CATALOGUE = `https://raw.githubusercontent.com/drezzillah-prog/velvet-charms-body-glow-official/${BODY_COMMIT}/catalogue-body-glow.json`;
const BODY_ASSETS = `https://raw.githubusercontent.com/drezzillah-prog/velvet-charms-body-glow-official/${BODY_COMMIT}/`;

// US V1 is deliberately narrow. Existing Body Glow stays immutable and untouched.
// Face/hand products are matched by current source IDs but presented as the anhydrous
// balm concepts from the approved US launch guide. Final formula/label data is a launch gate.
const US_V1 = new Map([
  ["body_butter_100", { displayName: "Body Butter (100ml)", family: "Body Butter" }],
  ["face_cream", { displayName: "Nourishing Face Balm (50ml)", family: "Face Balm" }],
  ["hand_foot_cream", { displayName: "Hand & Foot Balm", family: "Hand & Foot Balm" }],
  ["solid_perfume", { displayName: "Solid Perfume (50ml)", family: "Solid Perfume" }],
  ["perfume_rollon", { displayName: "Perfume Oil Roll-On (10ml)", family: "Perfume Oil Roll-On" }],
  ["soap_exfoliating", { displayName: "Exfoliating Glycerin Soap (100g)", family: "Glycerin Soap" }],
  ["soap_moisturizing", { displayName: "Moisturizing Glycerin Soap (100g)", family: "Glycerin Soap" }],
  ["soap_herbal", { displayName: "Natural Herbal Glycerin Soap", family: "Glycerin Soap" }]
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

function usdPrice(product) {
  const base = Number(product.price);
  if (!Number.isFinite(base) || base <= 0) throw new Error("INVALID_PRICE");
  return Number(base.toFixed(2));
}

function sourceProducts(body) {
  return (body.categories || []).flatMap(flatten);
}

function asUsV1(product) {
  const config = US_V1.get(product.id);
  if (!config) return null;
  return {
    ...product,
    name: config.displayName,
    studio_family: config.family,
    price: usdPrice(product),
    __source: "body",
    __source_id: product.id,
    __launch_status: "compliance-gated"
  };
}

export async function publicCatalogue() {
  const { body } = await sourceData();
  const products = sourceProducts(body).map(asUsV1).filter(Boolean);
  const grouped = new Map();
  for (const product of products) {
    if (!grouped.has(product.studio_family)) grouped.set(product.studio_family, []);
    grouped.get(product.studio_family).push(product);
  }
  const sections = [...grouped.entries()].map(([name, familyProducts]) => ({
    kind: "us-v1",
    source: "body",
    assetBase: BODY_ASSETS,
    category: { id: `us-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, name, products: familyProducts }
  }));
  return {
    currency: STUDIO_CURRENCY,
    market: STUDIO_MARKET,
    sourceMode: "immutable-pinned-us-v1",
    sourceCommits: { body: BODY_COMMIT },
    checkoutGate: "STORE_LIVE",
    sections
  };
}

export async function studioCatalogue() {
  if (productCache && Date.now() - sourceCacheAt < CACHE_MS) return productCache;
  const { body } = await sourceData();
  const products = new Map();
  for (const source of sourceProducts(body)) {
    const product = asUsV1(source);
    if (product) products.set(`body:${product.id}`, product);
  }
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
    return {
      key,
      id: String(product.id),
      source: product.__source,
      name: String(product.name).slice(0, 127),
      quantity,
      price: usdPrice(product),
      options: cleanOptions(product, raw?.options)
    };
  });
}

export function marketFromRequest(req) {
  const country = String(req.headers["x-vercel-ip-country"] || "").toUpperCase();
  return country === "US" ? "US" : "NON_US";
}
