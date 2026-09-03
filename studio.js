(() => {
  'use strict';

  const CART_KEY = 'velvetStudioCartV2';
  const CHECKOUT_KEY = 'velvetStudioCheckoutV2';
  const state = {
    sections: [],
    metaByKey: new Map(),
    filter: 'all',
    cart: loadCart(),
    market: 'INTL',
    storeStatus: { storeLive: false, paypalConfigured: false, contactConfigured: false }
  };

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const encPath = path => String(path || '').split('/').map(encodeURIComponent).join('/');
  const labelize = key => String(key || '').replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

  function loadCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.key === 'string') : [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
    updateCartUi();
  }

  function productsOf(category) {
    return [
      ...(category.products || []).map(product => ({ product, subcategory: '' })),
      ...(category.subcategories || []).flatMap(sub => (sub.products || []).map(product => ({ product, subcategory: sub.name || '' })))
    ];
  }

  function imageUrl(meta, path) {
    return `${meta.assetBase}${encPath(path)}`;
  }

  function euroPrice(product, source) {
    const ron = Number(product.price_ro);
    const base = Number(product.price);
    if (state.market === 'RO' && Number.isFinite(ron)) return Number((ron / 5).toFixed(2));
    if (source === 'art' && Number.isFinite(base)) return Number(base.toFixed(2));
    if (source === 'body' && Number.isFinite(ron)) return Number((ron / 5).toFixed(2));
    return Number.isFinite(base) ? Number(base.toFixed(2)) : 0;
  }

  function displayPrice(product, source) {
    const ron = Number(product.price_ro);
    const eur = euroPrice(product, source);
    if (state.market === 'RO' && Number.isFinite(ron)) return `${ron.toLocaleString('ro-RO')} RON · €${eur.toFixed(2)}`;
    return `€${eur.toFixed(2)}`;
  }

  function registerCatalogue(payload) {
    state.market = payload.market === 'RO' ? 'RO' : 'INTL';
    state.sections = [];
    state.metaByKey = new Map();

    for (const section of payload.sections || []) {
      const normalized = {
        kind: section.kind,
        source: section.source,
        assetBase: section.assetBase,
        category: section.category,
        metaById: new Map()
      };
      for (const { product, subcategory } of productsOf(section.category || {})) {
        const key = `${section.source}:${product.id}`;
        const meta = {
          key,
          kind: section.kind,
          source: section.source,
          assetBase: section.assetBase,
          category: section.category,
          subcategory,
          product
        };
        normalized.metaById.set(product.id, meta);
        state.metaByKey.set(key, meta);
      }
      state.sections.push(normalized);
    }
  }

  function galleryThumbs(meta) {
    const images = meta.product.images || [];
    if (images.length < 2) return '';
    return `<div class="card-thumbs">${images.slice(0, 5).map((path, index) => `<button type="button" data-card-image="${index}" data-card-key="${esc(meta.key)}" aria-label="Show image ${index + 1} of ${esc(meta.product.name)}"><img src="${esc(imageUrl(meta, path))}" alt="" loading="lazy" decoding="async"></button>`).join('')}</div>`;
  }

  function cardMarkup(meta) {
    const product = meta.product;
    const first = product.images?.[0];
    const preview = meta.kind === 'preview';
    const badge = preview ? 'Preview · review pending' : meta.kind === 'art' ? 'Art & Gifts' : 'Studio textile';
    return `<article class="product-card" data-kind="${esc(meta.kind)}" data-id="${esc(product.id)}">
      <div class="card-media">
        ${first ? `<img class="card-main-image" src="${esc(imageUrl(meta, first))}" alt="${esc(product.name)}" loading="lazy" decoding="async" data-open-image="${esc(meta.key)}">` : '<div class="image-placeholder"></div>'}
        ${galleryThumbs(meta)}
      </div>
      <div class="product-body">
        <span class="badge ${preview ? 'preview' : ''}">${esc(badge)}</span>
        <h3>${esc(product.name)}</h3>
        <p>${esc(product.description || '')}</p>
        <small class="product-ref">Ref. ${esc(meta.key)}</small>
        <div class="price">${esc(displayPrice(product, meta.source))}</div>
        <div class="product-actions">
          <button class="details-btn" type="button" data-details="${esc(meta.key)}">Details</button>
          <button class="buy-btn" type="button" ${preview ? 'disabled title="Not for sale until candle safety-label review is completed"' : `data-order="${esc(meta.key)}"`}>${preview ? 'Not yet for sale' : 'Choose & add'}</button>
        </div>
      </div>
    </article>`;
  }

  function categoryMarkup(section) {
    const category = section.category;
    const groups = [];
    for (const sub of category.subcategories || []) {
      const products = (sub.products || []).map(product => section.metaById.get(product.id)).filter(Boolean);
      if (products.length) groups.push(`<h3 class="subcategory-title">${esc(sub.name)}</h3><div class="product-grid">${products.map(cardMarkup).join('')}</div>`);
    }
    const direct = (category.products || []).map(product => section.metaById.get(product.id)).filter(Boolean);
    if (direct.length) groups.push(`<div class="product-grid">${direct.map(cardMarkup).join('')}</div>`);

    const count = section.metaById.size;
    const note = section.kind === 'preview'
      ? 'Shown for planning only. These candles are not enabled for ordering until their formulation-specific CLP and safety-label review is complete.'
      : (category.notice || `${count} handmade product${count === 1 ? '' : 's'} in this section.`);

    return `<section class="category-block" data-section-kind="${esc(section.kind)}">
      <div class="category-heading"><h2>${esc(category.name)}</h2><p class="category-note">${esc(note)}</p></div>
      ${groups.join('')}
    </section>`;
  }

  function renderCatalogue() {
    const root = document.getElementById('catalogue-root');
    if (!root) return;
    const visible = state.sections.filter(section => state.filter === 'all' || section.kind === state.filter);
    root.innerHTML = visible.map(categoryMarkup).join('') || '<p>No products match this filter.</p>';
  }

  function optionsPreview(product) {
    const entries = Object.entries(product.options || {});
    if (!entries.length) return '<p>Custom requests can still be discussed before production.</p>';
    return `<div class="options-preview">${entries.map(([key, values]) => `<div><strong>${esc(labelize(key))}</strong><p>${esc((Array.isArray(values) ? values : [values]).join(' · '))}</p></div>`).join('')}</div>`;
  }

  function optionsForm(product) {
    const fields = Object.entries(product.options || {}).map(([key, values]) => `<label class="field"><span>${esc(labelize(key))}</span><select name="${esc(key)}"><option value="">Choose</option>${(Array.isArray(values) ? values : [values]).map(value => `<option value="${esc(value)}">${esc(value)}</option>`).join('')}</select></label>`).join('');
    return `${fields}<label class="field field-wide"><span>Special instructions</span><textarea name="special_instructions" maxlength="1000" rows="4" placeholder="Anything we should know about your custom piece?"></textarea></label>`;
  }

  function dialogGallery(meta) {
    const images = meta.product.images || [];
    if (!images.length) return '<div></div>';
    return `<div class="dialog-gallery">
      <img class="dialog-main-image" src="${esc(imageUrl(meta, images[0]))}" alt="${esc(meta.product.name)}" data-lightbox-src="${esc(imageUrl(meta, images[0]))}">
      ${images.length > 1 ? `<div class="dialog-thumbs">${images.map((path, index) => `<button type="button" data-dialog-image="${index}" data-key="${esc(meta.key)}" aria-label="Show image ${index + 1}"><img src="${esc(imageUrl(meta, path))}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
    </div>`;
  }

  function openProductDialog(key, ordering) {
    const meta = state.metaByKey.get(key);
    if (!meta) return;
    const product = meta.product;
    const preview = meta.kind === 'preview';
    const dialog = document.getElementById('product-dialog');
    const content = document.getElementById('dialog-content');
    if (!dialog || !content) return;

    content.innerHTML = `<div class="dialog-wrap">
      ${dialogGallery(meta)}
      <div class="dialog-copy">
        <span class="badge ${preview ? 'preview' : ''}">${preview ? 'Preview only' : meta.kind === 'art' ? 'Art & Gifts' : 'Studio textile'}</span>
        <h2>${esc(product.name)}</h2>
        <p>${esc(product.description || '')}</p>
        <p class="price">${esc(displayPrice(product, meta.source))}</p>
        <p class="product-ref">Product reference: ${esc(meta.key)}</p>
        ${ordering && !preview ? `<form id="customize-form" data-key="${esc(key)}"><div class="customization-grid">${optionsForm(product)}</div><label class="field qty-field"><span>Quantity</span><input name="qty" type="number" min="1" max="20" value="1" required></label><button class="btn primary full" type="submit">Add to cart</button></form>` : `<h3>Available choices</h3>${optionsPreview(product)}`}
        ${preview ? '<p><strong>This product is deliberately disabled for sale until its candle-specific safety-label review is complete.</strong></p>' : ''}
        <p class="source-note">This Studio listing is sourced from an immutable approved catalogue snapshot. The original Velvet Charms websites remain separate and untouched.</p>
      </div>
    </div>`;

    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  }

  function openLightbox(src, alt) {
    let lightbox = document.getElementById('image-lightbox');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.id = 'image-lightbox';
      lightbox.className = 'image-lightbox';
      lightbox.innerHTML = '<button type="button" class="lightbox-close" aria-label="Close image">×</button><img alt="">';
      document.body.appendChild(lightbox);
    }
    const image = lightbox.querySelector('img');
    image.src = src;
    image.alt = alt || 'Product image';
    lightbox.classList.add('open');
  }

  function closeLightbox() {
    document.getElementById('image-lightbox')?.classList.remove('open');
  }

  function addToCart(key, qty, options) {
    const meta = state.metaByKey.get(key);
    if (!meta || meta.kind === 'preview') return;
    const signature = JSON.stringify(options || {});
    const existing = state.cart.find(item => item.key === key && JSON.stringify(item.options || {}) === signature);
    if (existing) existing.qty = Math.min(20, Number(existing.qty || 0) + qty);
    else state.cart.push({ key, qty, options: options || {} });
    saveCart();
    document.getElementById('product-dialog')?.close();
    openCart();
  }

  function detailedCart() {
    return state.cart.map((item, index) => ({ ...item, index, meta: state.metaByKey.get(item.key) })).filter(item => item.meta && item.meta.kind !== 'preview');
  }

  function updateCartUi() {
    const count = state.cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = String(count); });
    renderCart();
  }

  function renderCart() {
    const root = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if (!root || !totalEl) return;
    const items = detailedCart();
    if (!items.length) {
      root.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
      totalEl.textContent = '€0.00';
      updateCheckoutAvailability();
      return;
    }

    let total = 0;
    root.innerHTML = items.map(item => {
      const unit = euroPrice(item.meta.product, item.meta.source);
      total += unit * Number(item.qty || 0);
      const optionLines = Object.entries(item.options || {}).filter(([, value]) => value).map(([key, value]) => `<small>${esc(labelize(key))}: ${esc(value)}</small>`).join('');
      return `<div class="cart-line">
        <div><strong>${esc(item.meta.product.name)}</strong>${optionLines}</div>
        <div class="cart-line-controls">
          <input aria-label="Quantity for ${esc(item.meta.product.name)}" type="number" min="1" max="20" value="${esc(item.qty)}" data-cart-qty="${item.index}">
          <span>€${(unit * Number(item.qty || 0)).toFixed(2)}</span>
          <button type="button" data-cart-remove="${item.index}" aria-label="Remove ${esc(item.meta.product.name)}">×</button>
        </div>
      </div>`;
    }).join('');
    totalEl.textContent = `€${total.toFixed(2)}`;
    updateCheckoutAvailability();
  }

  function updateCheckoutAvailability() {
    const button = document.getElementById('checkout-btn');
    const status = document.getElementById('checkout-status');
    if (!button) return;
    if (!state.cart.length) {
      button.disabled = true;
      if (status) status.textContent = '';
      return;
    }
    if (!state.storeStatus.storeLive) {
      button.disabled = true;
      if (status) status.textContent = 'Checkout is safely locked until the Studio launch settings are completed.';
      return;
    }
    if (!state.storeStatus.paypalConfigured) {
      button.disabled = true;
      if (status) status.textContent = 'PayPal checkout is not configured yet.';
      return;
    }
    button.disabled = false;
    if (status) status.textContent = '';
  }

  function openCart() {
    document.getElementById('cart-drawer')?.classList.add('open');
    document.getElementById('cart-backdrop')?.classList.add('open');
    document.body.classList.add('cart-open');
  }

  function closeCart() {
    document.getElementById('cart-drawer')?.classList.remove('open');
    document.getElementById('cart-backdrop')?.classList.remove('open');
    document.body.classList.remove('cart-open');
  }

  async function loadStoreStatus() {
    try {
      const response = await fetch('/api/store-status', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      state.storeStatus = {
        storeLive: Boolean(data.storeLive),
        paypalConfigured: Boolean(data.paypalConfigured),
        contactConfigured: Boolean(data.contactConfigured)
      };
    } catch {
      state.storeStatus = { storeLive: false, paypalConfigured: false, contactConfigured: false };
    }
    updateCheckoutAvailability();
  }

  async function beginCheckout() {
    if (!state.cart.length || !state.storeStatus.storeLive || !state.storeStatus.paypalConfigured) return;
    const button = document.getElementById('checkout-btn');
    const status = document.getElementById('checkout-status');
    const requiredByDate = document.getElementById('required-by-date')?.value || '';
    button.disabled = true;
    if (status) status.textContent = 'Connecting securely to PayPal…';
    try {
      const cart = { items: state.cart, requiredByDate };
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.orderID || !result.approveUrl) throw new Error(result.error || 'Checkout could not be started.');
      sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify({ orderID: result.orderID, cart }));
      location.href = result.approveUrl;
    } catch (error) {
      if (status) status.textContent = error.message || 'Checkout could not be started.';
      updateCheckoutAvailability();
    }
  }

  async function completeReturnedPayment() {
    const params = new URLSearchParams(location.search);
    const marker = params.get('payment');
    if (!marker) return;
    const banner = document.getElementById('payment-banner');

    if (marker === 'cancelled') {
      if (banner) {
        banner.hidden = false;
        banner.className = 'payment-banner warning';
        banner.textContent = 'Payment was cancelled. Your cart is still here.';
      }
      history.replaceState({}, '', location.pathname);
      return;
    }
    if (marker !== 'success') return;

    let checkout = null;
    try { checkout = JSON.parse(sessionStorage.getItem(CHECKOUT_KEY) || 'null'); } catch {}
    const orderID = params.get('token') || checkout?.orderID;
    if (!checkout?.cart || !orderID) {
      if (banner) {
        banner.hidden = false;
        banner.className = 'payment-banner warning';
        banner.textContent = 'PayPal returned successfully, but the matching checkout details are no longer in this browser. Please contact us with your PayPal order reference.';
      }
      return;
    }

    if (banner) {
      banner.hidden = false;
      banner.className = 'payment-banner';
      banner.textContent = 'Confirming your payment…';
    }

    try {
      const response = await fetch('/api/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderID, cart: checkout.cart })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.status !== 'COMPLETED') throw new Error(result.error || 'Payment could not be confirmed.');
      state.cart = [];
      saveCart();
      sessionStorage.removeItem(CHECKOUT_KEY);
      if (banner) {
        banner.className = 'payment-banner success';
        banner.textContent = `Payment confirmed. Thank you — PayPal reference ${result.captureID || result.orderID}.`;
      }
      history.replaceState({}, '', location.pathname);
    } catch (error) {
      if (banner) {
        banner.className = 'payment-banner warning';
        banner.textContent = error.message || 'Payment could not be confirmed automatically.';
      }
    }
  }

  async function init() {
    const status = document.getElementById('catalogue-status');
    try {
      const [catalogueResponse] = await Promise.all([
        fetch('/api/catalogue', { cache: 'no-store' }),
        loadStoreStatus()
      ]);
      const payload = await catalogueResponse.json().catch(() => ({}));
      if (!catalogueResponse.ok || !Array.isArray(payload.sections)) throw new Error(payload.error || 'Catalogue unavailable');
      registerCatalogue(payload);
      const sellableCount = state.sections.filter(section => section.kind !== 'preview').reduce((sum, section) => sum + section.metaById.size, 0);
      const previewCount = state.sections.filter(section => section.kind === 'preview').reduce((sum, section) => sum + section.metaById.size, 0);
      if (status) status.textContent = `${sellableCount} launch products loaded${previewCount ? ` · ${previewCount} candle products shown as non-sale preview` : ''}.`;
      renderCatalogue();
      updateCartUi();
      await completeReturnedPayment();
    } catch (error) {
      console.error(error);
      if (status) status.textContent = 'The Studio catalogue could not be loaded. No products are enabled for ordering.';
      updateCheckoutAvailability();
    }
  }

  document.addEventListener('submit', event => {
    if (!event.target.matches('#customize-form')) return;
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const qty = Math.max(1, Math.min(20, Number.parseInt(data.get('qty'), 10) || 1));
    const options = {};
    for (const [key, value] of data.entries()) {
      if (key === 'qty') continue;
      const clean = String(value || '').trim();
      if (clean) options[key] = clean;
    }
    addToCart(form.dataset.key, qty, options);
  });

  document.addEventListener('change', event => {
    const qtyInput = event.target.closest('[data-cart-qty]');
    if (!qtyInput) return;
    const index = Number.parseInt(qtyInput.dataset.cartQty, 10);
    if (!state.cart[index]) return;
    state.cart[index].qty = Math.max(1, Math.min(20, Number.parseInt(qtyInput.value, 10) || 1));
    saveCart();
  });

  document.addEventListener('click', event => {
    const filter = event.target.closest('[data-filter]');
    if (filter) {
      document.querySelectorAll('[data-filter]').forEach(button => button.classList.toggle('active', button === filter));
      state.filter = filter.dataset.filter;
      renderCatalogue();
      return;
    }

    const cardThumb = event.target.closest('[data-card-image]');
    if (cardThumb) {
      const meta = state.metaByKey.get(cardThumb.dataset.cardKey);
      const index = Number.parseInt(cardThumb.dataset.cardImage, 10);
      const card = cardThumb.closest('.product-card');
      const main = card?.querySelector('.card-main-image');
      const path = meta?.product.images?.[index];
      if (main && path) main.src = imageUrl(meta, path);
      return;
    }

    const dialogThumb = event.target.closest('[data-dialog-image]');
    if (dialogThumb) {
      const meta = state.metaByKey.get(dialogThumb.dataset.key);
      const index = Number.parseInt(dialogThumb.dataset.dialogImage, 10);
      const path = meta?.product.images?.[index];
      const main = document.querySelector('.dialog-main-image');
      if (main && path) {
        const src = imageUrl(meta, path);
        main.src = src;
        main.dataset.lightboxSrc = src;
      }
      return;
    }

    const imageTrigger = event.target.closest('[data-open-image]');
    if (imageTrigger) {
      openLightbox(imageTrigger.src, imageTrigger.alt);
      return;
    }

    const dialogImage = event.target.closest('[data-lightbox-src]');
    if (dialogImage) {
      openLightbox(dialogImage.dataset.lightboxSrc, dialogImage.alt);
      return;
    }

    const details = event.target.closest('[data-details]');
    if (details) return openProductDialog(details.dataset.details, false);

    const order = event.target.closest('[data-order]');
    if (order) return openProductDialog(order.dataset.order, true);

    const remove = event.target.closest('[data-cart-remove]');
    if (remove) {
      const index = Number.parseInt(remove.dataset.cartRemove, 10);
      if (state.cart[index]) state.cart.splice(index, 1);
      saveCart();
      return;
    }

    if (event.target.closest('[data-open-cart]')) return openCart();
    if (event.target.closest('[data-close-cart]') || event.target.id === 'cart-backdrop') return closeCart();
    if (event.target.closest('.dialog-close')) return document.getElementById('product-dialog')?.close();
    if (event.target.closest('.lightbox-close') || event.target.id === 'image-lightbox') return closeLightbox();
    if (event.target.closest('#checkout-btn')) return beginCheckout();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeCart();
      closeLightbox();
    }
  });

  document.addEventListener('DOMContentLoaded', init);
})();
