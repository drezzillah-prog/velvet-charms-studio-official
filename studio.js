(() => {
  'use strict';

  const SOURCES = {
    art: {
      catalogue: 'https://raw.githubusercontent.com/drezzillah-prog/velvet-charms-art-gifts-official/a29437db52068129f0c5db9e7a6aa41de96fa929/catalogue-art-gifts.json',
      pricing: 'https://raw.githubusercontent.com/drezzillah-prog/velvet-charms-art-gifts-official/a29437db52068129f0c5db9e7a6aa41de96fa929/pricing-ro.json',
      assets: 'https://raw.githubusercontent.com/drezzillah-prog/velvet-charms-art-gifts-official/a29437db52068129f0c5db9e7a6aa41de96fa929/'
    },
    body: {
      catalogue: 'https://raw.githubusercontent.com/drezzillah-prog/velvet-charms-body-glow-official/543bad871521bc1dace35cdf5d02b0f6aa2de279/catalogue-body-glow.json',
      assets: 'https://raw.githubusercontent.com/drezzillah-prog/velvet-charms-body-glow-official/543bad871521bc1dace35cdf5d02b0f6aa2de279/'
    }
  };

  const BODY_LAUNCH_CATEGORY = 'Knitted & Braided Wool Creations';
  const BODY_PREVIEW_CATEGORY = 'Candles';
  const ART_EXCLUDED_CATEGORIES = new Set(['Bundles']);
  const ART_EXCLUDED_PRODUCT_IDS = new Set(['epoxy_lamp', 'wall_clock_large']);
  const CART_KEY = 'velvetStudioCartV1';
  const CHECKOUT_KEY = 'velvetStudioCheckoutV1';
  const state = { sections: [], filter: 'all', cart: loadCart(), market: 'INTL' };

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const encPath = path => String(path || '').split('/').map(encodeURIComponent).join('/');
  const imageUrl = (source, path) => source.assets + encPath(path);

  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(raw) ? raw.filter(item => item && typeof item.key === 'string') : [];
    } catch { return []; }
  }
  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
    updateCartUi();
  }
  function productsOf(category) {
    const items = [];
    (category.products || []).forEach(product => items.push({ product, subcategory: '' }));
    (category.subcategories || []).forEach(sub => (sub.products || []).forEach(product => items.push({ product, subcategory: sub.name || '' })));
    return items;
  }
  function categoryCount(category) { return productsOf(category).length; }
  async function loadJson(url) {
    const response = await fetch(url, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`Could not load source (${response.status})`);
    return response.json();
  }
  function applyArtPricing(catalogue, pricing) {
    (catalogue.categories || []).forEach(category => productsOf(category).forEach(({product}) => {
      const ron = Number(pricing?.[product.id]);
      if (Number.isFinite(ron)) product.price_ro = ron;
    }));
  }
  function euroPrice(product, sourceKey) {
    const ron = Number(product.price_ro);
    const original = Number(product.price);
    if (state.market === 'RO' && Number.isFinite(ron)) return Number((ron / 5).toFixed(2));
    if (sourceKey === 'art' && Number.isFinite(original)) return Number(original.toFixed(2));
    if (sourceKey === 'body' && Number.isFinite(ron)) return Number((ron / 5).toFixed(2));
    return Number.isFinite(original) ? Number(original.toFixed(2)) : 0;
  }
  function priceMarkup(product, sourceKey) {
    const ron = Number(product.price_ro);
    const eur = euroPrice(product, sourceKey);
    if (state.market === 'RO' && Number.isFinite(ron)) return `${ron.toLocaleString('ro-RO')} RON · €${eur.toFixed(2)}`;
    return `€${eur.toFixed(2)}`;
  }
  function cardMarkup(item, meta) {
    const p = item.product;
    const img = p.images?.[0] ? imageUrl(meta.source, p.images[0]) : '';
    const preview = meta.kind === 'preview';
    const badge = preview ? '<span class="badge preview">Preview · safety label review pending</span>' : `<span class="badge">${meta.kind === 'art' ? 'Art & Gifts' : 'Studio textile'}</span>`;
    return `<article class="product-card" data-kind="${meta.kind}" data-id="${esc(p.id)}">
      ${img ? `<img src="${esc(img)}" alt="${esc(p.name)}" loading="lazy" decoding="async">` : ''}
      <div class="product-body">
        ${badge}
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.description || '')}</p>
        <div class="price">${esc(priceMarkup(p, meta.sourceKey))}</div>
        <div class="product-actions">
          <button class="details-btn" type="button" data-details="${esc(meta.key)}">Details</button>
          <button class="buy-btn" type="button" ${preview ? 'disabled title="Not for sale until candle safety-label review is completed"' : `data-order="${esc(meta.key)}"`}>${preview ? 'Not yet for sale' : 'Choose & add'}</button>
        </div>
      </div>
    </article>`;
  }
  function categoryMarkup(section) {
    const c = section.category;
    const groups = [];
    if (Array.isArray(c.subcategories)) {
      c.subcategories.forEach(sub => {
        const products = (sub.products || []).filter(product => !ART_EXCLUDED_PRODUCT_IDS.has(product.id));
        if (!products.length) return;
        groups.push(`<h3 class="subcategory-title">${esc(sub.name)}</h3><div class="product-grid">${products.map(product => cardMarkup({product,subcategory:sub.name}, section.metaById.get(product.id))).join('')}</div>`);
      });
    }
    if (Array.isArray(c.products) && c.products.length) {
      const products = c.products.filter(product => !ART_EXCLUDED_PRODUCT_IDS.has(product.id));
      if (products.length) groups.push(`<div class="product-grid">${products.map(product => cardMarkup({product,subcategory:''}, section.metaById.get(product.id))).join('')}</div>`);
    }
    const note = section.kind === 'preview'
      ? 'Shown for planning only. These candles are not enabled for ordering until their formulation-specific CLP and label review is complete.'
      : (c.notice || `${categoryCount(c)} handmade product${categoryCount(c) === 1 ? '' : 's'} in this section.`);
    return `<section class="category-block" data-section-kind="${section.kind}"><div class="category-heading"><h2>${esc(c.name)}</h2><p class="category-note">${esc(note)}</p></div>${groups.join('')}</section>`;
  }
  function render() {
    const root = document.getElementById('catalogue-root');
    if (!root) return;
    const visible = state.sections.filter(section => state.filter === 'all' || section.kind === state.filter);
    root.innerHTML = visible.map(categoryMarkup).join('') || '<p>No products match this filter.</p>';
  }
  function registerSection(category, kind, sourceKey, source) {
    const metaById = new Map();
    productsOf(category).forEach(({product}) => {
      if (sourceKey === 'art' && ART_EXCLUDED_PRODUCT_IDS.has(product.id)) return;
      const key = `${sourceKey}:${product.id}`;
      metaById.set(product.id, { key, kind, sourceKey, source, product, category });
    });
    state.sections.push({ category, kind, sourceKey, source, metaById });
  }
  function findMeta(key) {
    for (const section of state.sections) for (const meta of section.metaById.values()) if (meta.key === key) return meta;
    return null;
  }
  function inputLabel(key) { return key.replaceAll('_',' ').replace(/\b\w/g, c => c.toUpperCase()); }
  function optionsForm(product, existing = {}) {
    const entries = Object.entries(product.options || {});
    const fields = entries.map(([key, values]) => `<label class="field"><span>${esc(inputLabel(key))}</span><select name="${esc(key)}"><option value="">Choose</option>${(Array.isArray(values) ? values : [values]).map(value => `<option value="${esc(value)}" ${existing[key] === value ? 'selected' : ''}>${esc(value)}</option>`).join('')}</select></label>`).join('');
    return `${fields}<label class="field field-wide"><span>Special instructions</span><textarea name="special_instructions" maxlength="1000" rows="4" placeholder="Anything we should know about your custom piece?">${esc(existing.special_instructions || '')}</textarea></label>`;
  }
  function openDetails(key, ordering = false) {
    const meta = findMeta(key);
    if (!meta) return;
    const p = meta.product;
    const dialog = document.getElementById('product-dialog');
    const content = document.getElementById('dialog-content');
    const img = p.images?.[0] ? imageUrl(meta.source, p.images[0]) : '';
    const preview = meta.kind === 'preview';
    content.innerHTML = `<div class="dialog-wrap">${img ? `<img src="${esc(img)}" alt="${esc(p.name)}">` : '<div></div>'}<div class="dialog-copy"><span class="badge ${preview ? 'preview' : ''}">${preview ? 'Preview only' : meta.kind === 'art' ? 'Art & Gifts' : 'Studio textile'}</span><h2>${esc(p.name)}</h2><p>${esc(p.description || '')}</p><p class="price">${esc(priceMarkup(p, meta.sourceKey))}</p>${ordering && !preview ? `<form id="customize-form" data-key="${esc(key)}"><div class="customization-grid">${optionsForm(p)}</div><label class="field qty-field"><span>Quantity</span><input name="qty" type="number" min="1" max="20" value="1" required></label><button class="btn primary full" type="submit">Add to cart</button></form>` : `<h3>Available choices</h3>${Object.entries(p.options || {}).length ? `<div class="options-preview">${Object.entries(p.options || {}).map(([label,values]) => `<div><strong>${esc(inputLabel(label))}</strong><p>${esc((Array.isArray(values) ? values : [values]).join(' · '))}</p></div>`).join('')}</div>` : '<p>Custom requests can be discussed before production.</p>'}`}${preview ? '<p><strong>This product is deliberately disabled for sale until the candle-specific safety-label review is complete.</strong></p>' : ''}</div></div>`;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open','');
  }
  function addToCart(key, qty, options) {
    const meta = findMeta(key);
    if (!meta || meta.kind === 'preview') return;
    const signature = JSON.stringify(options || {});
    const existing = state.cart.find(item => item.key === key && JSON.stringify(item.options || {}) === signature);
    if (existing) existing.qty = Math.min(20, existing.qty + qty);
    else state.cart.push({ key, qty, options: options || {} });
    saveCart();
    document.getElementById('product-dialog')?.close();
    openCart();
  }
  function cartDetailed() {
    return state.cart.map((item, index) => ({ ...item, index, meta: findMeta(item.key) })).filter(item => item.meta);
  }
  function updateCartUi() {
    const count = state.cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = String(count));
    renderCart();
  }
  function renderCart() {
    const root = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if (!root || !totalEl) return;
    const detailed = cartDetailed();
    if (!detailed.length) {
      root.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
      totalEl.textContent = '€0.00';
      return;
    }
    let total = 0;
    root.innerHTML = detailed.map(item => {
      const p = item.meta.product;
      const unit = euroPrice(p, item.meta.sourceKey);
      total += unit * item.qty;
      const options = Object.entries(item.options || {}).filter(([,v]) => v).map(([k,v]) => `<small>${esc(inputLabel(k))}: ${esc(v)}</small>`).join('');
      return `<div class="cart-line"><div><strong>${esc(p.name)}</strong>${options}</div><div class="cart-line-controls"><input aria-label="Quantity for ${esc(p.name)}" type="number" min="1" max="20" value="${item.qty}" data-cart-qty="${item.index}"><span>€${(unit * item.qty).toFixed(2)}</span><button type="button" data-cart-remove="${item.index}" aria-label="Remove ${esc(p.name)}">×</button></div></div>`;
    }).join('');
    totalEl.textContent = `€${total.toFixed(2)}`;
  }
  function openCart() { document.getElementById('cart-drawer')?.classList.add('open'); document.getElementById('cart-backdrop')?.classList.add('open'); document.body.classList.add('cart-open'); }
  function closeCart() { document.getElementById('cart-drawer')?.classList.remove('open'); document.getElementById('cart-backdrop')?.classList.remove('open'); document.body.classList.remove('cart-open'); }
  async function beginCheckout() {
    if (!state.cart.length) return;
    const button = document.getElementById('checkout-btn');
    const status = document.getElementById('checkout-status');
    const requiredByDate = document.getElementById('required-by-date')?.value || '';
    if (button) button.disabled = true;
    if (status) status.textContent = 'Connecting securely to PayPal…';
    try {
      const cart = { items: state.cart, requiredByDate };
      const response = await fetch('/api/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cart }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.approveUrl || !result.orderID) throw new Error(result.error || 'Checkout could not be started.');
      sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify({ orderID: result.orderID, cart }));
      location.href = result.approveUrl;
    } catch (error) {
      if (status) status.textContent = error.message || 'Checkout could not be started.';
      if (button) button.disabled = false;
    }
  }
  async function completeReturnedPayment() {
    const params = new URLSearchParams(location.search);
    const marker = params.get('payment');
    if (!marker) return;
    const banner = document.getElementById('payment-banner');
    if (marker === 'cancelled') {
      if (banner) { banner.hidden = false; banner.className = 'payment-banner warning'; banner.textContent = 'Payment was cancelled. Your cart is still here.'; }
      history.replaceState({}, '', location.pathname);
      return;
    }
    if (marker !== 'success') return;
    let checkout;
    try { checkout = JSON.parse(sessionStorage.getItem(CHECKOUT_KEY) || 'null'); } catch { checkout = null; }
    const token = params.get('token') || checkout?.orderID;
    if (!checkout?.cart || !token) {
      if (banner) { banner.hidden = false; banner.className = 'payment-banner warning'; banner.textContent = 'PayPal returned successfully, but this browser no longer has the matching checkout details. Please contact us with your PayPal order reference.'; }
      return;
    }
    if (banner) { banner.hidden = false; banner.className = 'payment-banner'; banner.textContent = 'Confirming your payment…'; }
    try {
      const response = await fetch('/api/capture-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderID: token, cart: checkout.cart }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.status !== 'COMPLETED') throw new Error(result.error || 'Payment could not be confirmed.');
      state.cart = [];
      saveCart();
      sessionStorage.removeItem(CHECKOUT_KEY);
      if (banner) { banner.className = 'payment-banner success'; banner.textContent = `Payment confirmed. Thank you — PayPal reference ${result.captureID || result.orderID}.`; }
      history.replaceState({}, '', location.pathname);
    } catch (error) {
      if (banner) { banner.className = 'payment-banner warning'; banner.textContent = error.message || 'Payment could not be confirmed automatically.'; }
    }
  }

  async function init() {
    const status = document.getElementById('catalogue-status');
    try {
      const [artCatalogue, artPricing, bodyCatalogue] = await Promise.all([loadJson(SOURCES.art.catalogue), loadJson(SOURCES.art.pricing), loadJson(SOURCES.body.catalogue)]);
      applyArtPricing(artCatalogue, artPricing);
      (artCatalogue.categories || []).filter(category => !ART_EXCLUDED_CATEGORIES.has(category.name)).forEach(category => registerSection(category, 'art', 'art', SOURCES.art));
      const wool = (bodyCatalogue.categories || []).find(category => category.name === BODY_LAUNCH_CATEGORY);
      if (wool) registerSection(wool, 'textiles', 'body', SOURCES.body);
      const candles = (bodyCatalogue.categories || []).find(category => category.name === BODY_PREVIEW_CATEGORY);
      if (candles) registerSection(candles, 'preview', 'body', SOURCES.body);
      const sellableCount = state.sections.filter(section => section.kind !== 'preview').reduce((sum, section) => sum + [...section.metaById.values()].length, 0);
      const previewCount = state.sections.filter(section => section.kind === 'preview').reduce((sum, section) => sum + [...section.metaById.values()].length, 0);
      if (status) status.textContent = `${sellableCount} launch products loaded${previewCount ? ` · ${previewCount} candle products shown as non-sale preview` : ''}.`;
      render();
      updateCartUi();
      completeReturnedPayment();
    } catch (error) {
      console.error(error);
      if (status) status.textContent = 'The catalogue snapshot could not be loaded. No products have been enabled for ordering.';
    }
  }

  document.addEventListener('submit', event => {
    if (!event.target.matches('#customize-form')) return;
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const qty = Math.max(1, Math.min(20, Number.parseInt(data.get('qty'), 10) || 1));
    const options = {};
    for (const [key, value] of data.entries()) if (key !== 'qty' && String(value).trim()) options[key] = String(value).trim();
    addToCart(form.dataset.key, qty, options);
  });

  document.addEventListener('change', event => {
    const qty = event.target.closest('[data-cart-qty]');
    if (!qty) return;
    const index = Number.parseInt(qty.dataset.cartQty, 10);
    if (!state.cart[index]) return;
    state.cart[index].qty = Math.max(1, Math.min(20, Number.parseInt(qty.value, 10) || 1));
    saveCart();
  });

  document.addEventListener('click', event => {
    const filter = event.target.closest('[data-filter]');
    if (filter) {
      document.querySelectorAll('[data-filter]').forEach(button => button.classList.toggle('active', button === filter));
      state.filter = filter.dataset.filter;
      render();
      return;
    }
    const details = event.target.closest('[data-details]');
    if (details) return openDetails(details.dataset.details, false);
    const order = event.target.closest('[data-order]');
    if (order) return openDetails(order.dataset.order, true);
    const remove = event.target.closest('[data-cart-remove]');
    if (remove) {
      const index = Number.parseInt(remove.dataset.cartRemove, 10);
      if (state.cart[index]) state.cart.splice(index, 1);
      saveCart();
      return;
    }
    if (event.target.closest('[data-open-cart]')) return openCart();
    if (event.target.closest('[data-close-cart]') || event.target.id === 'cart-backdrop') return closeCart();
    if (event.target.closest('.dialog-close')) document.getElementById('product-dialog')?.close();
    if (event.target.closest('#checkout-btn')) beginCheckout();
  });

  document.addEventListener('DOMContentLoaded', init);
})();
