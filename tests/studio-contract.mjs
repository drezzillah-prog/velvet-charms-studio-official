import fs from 'node:fs';

const requiredFiles = [
  'index.html','catalogue.html','faq.html','contact.html','legal.html','404.html',
  'styles.css','studio.js','contact.js','package.json','vercel.json','PRODUCT_LAUNCH_MATRIX.md',
  'api/catalogue.js','api/create-order.js','api/capture-order.js','api/contact.js','api/store-status.js','api/health.js',
  'lib/catalogue-source.js','tests/catalogue-source-live.mjs'
];
for (const file of requiredFiles) if (!fs.existsSync(file)) throw new Error(`missing required file: ${file}`);

const studio = fs.readFileSync('studio.js','utf8');
const source = fs.readFileSync('lib/catalogue-source.js','utf8');
const publicCatalogueApi = fs.readFileSync('api/catalogue.js','utf8');
const createOrder = fs.readFileSync('api/create-order.js','utf8');
const captureOrder = fs.readFileSync('api/capture-order.js','utf8');
const catalogue = fs.readFileSync('catalogue.html','utf8');
const legal = fs.readFileSync('legal.html','utf8');

if (!source.includes('543bad871521bc1dace35cdf5d02b0f6aa2de279')) throw new Error('Body Glow immutable source pin missing');
if (source.includes('a29437db52068129f0c5db9e7a6aa41de96fa929')) throw new Error('Art & Gifts must not feed USA Studio V1');
if (!source.includes('STUDIO_CURRENCY = "USD"') || !source.includes('STUDIO_MARKET = "US"')) throw new Error('USA/USD market contract missing');
for (const id of ['body_butter_100','face_cream','hand_foot_cream','solid_perfume','perfume_rollon','soap_exfoliating','soap_moisturizing','soap_herbal']) {
  if (!source.includes(id)) throw new Error(`USA V1 allowlist missing ${id}`);
}
for (const excluded of ['BODY_SELLABLE_CATEGORY','BODY_PREVIEW_CATEGORY','ART_EXCLUDED_CATEGORIES']) {
  if (source.includes(excluded)) throw new Error(`old common-store contract still present: ${excluded}`);
}
if (!studio.includes("fetch('/api/catalogue'")) throw new Error('browser catalogue is not routed through authoritative Studio API');
if (studio.includes('raw.githubusercontent.com')) throw new Error('browser must not bypass authoritative Studio catalogue API');
if (!publicCatalogueApi.includes('publicCatalogue') || !publicCatalogueApi.includes('marketFromRequest')) throw new Error('public catalogue API lost authoritative source/market routing');
for (const endpoint of ['/api/store-status','/api/create-order','/api/capture-order']) if (!studio.includes(endpoint)) throw new Error(`Studio client lost required endpoint ${endpoint}`);
if (!createOrder.includes('STORE_LIVE')) throw new Error('checkout launch gate missing');
if (!createOrder.includes('market !== "US"')) throw new Error('USA-only checkout gate missing');
if (!createOrder.includes('validateCart') || !captureOrder.includes('validateCart')) throw new Error('server-side cart validation missing');
if (!captureOrder.includes('fingerprint(items, date)')) throw new Error('capture cart fingerprint validation missing');
if (!catalogue.includes('data-open-cart') || !catalogue.includes('checkout-btn')) throw new Error('cart/checkout UI missing');
if (!studio.includes('card-thumbs') || !studio.includes('dialog-thumbs') || !studio.includes('image-lightbox')) throw new Error('product gallery/lightbox UX missing');
if (!legal.includes('STORE_LIVE=true')) throw new Error('prelaunch legal identity gate not documented');
if (/PAYPAL_CLIENT_SECRET\s*=\s*["'][^"']+["']/.test(createOrder + captureOrder)) throw new Error('PayPal secret must never be hardcoded');

console.log('Velvet Charms Studio USA V1 integrity contract PASS');
