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
  const state = { sections: [], filter: 'all' };

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const encPath = path => String(path || '').split('/').map(encodeURIComponent).join('/');
  const imageUrl = (source, path) => source.assets + encPath(path);

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

  function priceMarkup(product, sourceKey) {
    const ron = Number(product.price_ro);
    const original = Number(product.price);
    if (Number.isFinite(ron)) {
      const originalLabel = Number.isFinite(original) ? (sourceKey === 'art' ? ` · €${original}` : ` · $${original}`) : '';
      return `${ron.toLocaleString('ro-RO')} RON${originalLabel}`;
    }
    if (!Number.isFinite(original)) return 'Price confirmed with order';
    return sourceKey === 'art' ? `€${original}` : `$${original}`;
  }

  function cardMarkup(item, meta) {
    const p = item.product;
    const img = p.images?.[0] ? imageUrl(meta.source, p.images[0]) : '';
    const preview = meta.kind === 'preview';
    const badge = preview ? '<span class="badge preview">Preview · label review pending</span>' : `<span class="badge">${meta.kind === 'art' ? 'Art & Gifts' : 'Studio textile'}</span>`;
    return `<article class="product-card" data-kind="${meta.kind}" data-id="${esc(p.id)}">
      ${img ? `<img src="${esc(img)}" alt="${esc(p.name)}" loading="lazy" decoding="async">` : ''}
      <div class="product-body">
        ${badge}
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.description || '')}</p>
        <div class="price">${esc(priceMarkup(p, meta.sourceKey))}</div>
        <div class="product-actions">
          <button class="details-btn" type="button" data-details="${esc(meta.key)}">Details</button>
          <button class="buy-btn" type="button" ${preview ? 'disabled title="Not for sale until candle safety-label review is completed"' : `data-order="${esc(meta.key)}"`}>${preview ? 'Not yet for sale' : 'Order / customize'}</button>
        </div>
      </div>
    </article>`;
  }

  function categoryMarkup(section) {
    const c = section.category;
    const groups = [];
    if (Array.isArray(c.subcategories)) {
      c.subcategories.forEach(sub => {
        groups.push(`<h3 class="subcategory-title">${esc(sub.name)}</h3><div class="product-grid">${(sub.products || []).map(product => cardMarkup({product,subcategory:sub.name}, section.metaById.get(product.id))).join('')}</div>`);
      });
    }
    if (Array.isArray(c.products) && c.products.length) {
      groups.push(`<div class="product-grid">${c.products.map(product => cardMarkup({product,subcategory:''}, section.metaById.get(product.id))).join('')}</div>`);
    }
    const note = section.kind === 'preview'
      ? 'Shown for planning only. These candles are not enabled for ordering until formulation-specific CLP and label checks are completed.'
      : (c.notice || `${categoryCount(c)} handmade product${categoryCount(c) === 1 ? '' : 's'} in this section.`);
    return `<section class="category-block" data-section-kind="${section.kind}">
      <div class="category-heading"><h2>${esc(c.name)}</h2><p class="category-note">${esc(note)}</p></div>
      ${groups.join('')}
    </section>`;
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
      const key = `${sourceKey}:${product.id}`;
      metaById.set(product.id, { key, kind, sourceKey, source, product, category });
      product.__studioKey = key;
    });
    state.sections.push({ category, kind, sourceKey, source, metaById });
  }

  function findMeta(key) {
    for (const section of state.sections) {
      for (const meta of section.metaById.values()) if (meta.key === key) return meta;
    }
    return null;
  }

  function optionsMarkup(product) {
    const entries = Object.entries(product.options || {});
    if (!entries.length) return '<p>No fixed customization menu is attached to this product. Custom requests can still be discussed before production.</p>';
    return entries.map(([label, values]) => `<div><strong>${esc(label.replaceAll('_',' '))}</strong><ul class="options-list">${(Array.isArray(values) ? values : [values]).map(value => `<li>${esc(value)}</li>`).join('')}</ul></div>`).join('');
  }

  function openDetails(key, ordering = false) {
    const meta = findMeta(key);
    if (!meta) return;
    const p = meta.product;
    const dialog = document.getElementById('product-dialog');
    const content = document.getElementById('dialog-content');
    const img = p.images?.[0] ? imageUrl(meta.source, p.images[0]) : '';
    const preview = meta.kind === 'preview';
    content.innerHTML = `<div class="dialog-wrap">
      ${img ? `<img src="${esc(img)}" alt="${esc(p.name)}">` : '<div></div>'}
      <div class="dialog-copy">
        <span class="badge ${preview ? 'preview' : ''}">${preview ? 'Preview only' : meta.kind === 'art' ? 'Art & Gifts' : 'Studio textile'}</span>
        <h2>${esc(p.name)}</h2>
        <p>${esc(p.description || '')}</p>
        <p class="price">${esc(priceMarkup(p, meta.sourceKey))}</p>
        <h3>Available choices</h3>
        ${optionsMarkup(p)}
        ${ordering && !preview ? '<p><strong>Checkout is being connected to the new Studio project separately.</strong> The two original Velvet Charms websites are not used or modified by this Studio ordering flow.</p>' : ''}
        ${preview ? '<p><strong>This product is deliberately disabled for sale until the candle-specific safety-label review is complete.</strong></p>' : ''}
        <p class="source-note">Studio snapshot source is pinned to an immutable commit of the original catalogue; future edits to the original sites cannot silently change this launch selection.</p>
      </div>
    </div>`;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open','');
  }

  async function init() {
    const status = document.getElementById('catalogue-status');
    try {
      const [artCatalogue, artPricing, bodyCatalogue] = await Promise.all([
        loadJson(SOURCES.art.catalogue),
        loadJson(SOURCES.art.pricing),
        loadJson(SOURCES.body.catalogue)
      ]);
      applyArtPricing(artCatalogue, artPricing);

      (artCatalogue.categories || []).forEach(category => registerSection(category, 'art', 'art', SOURCES.art));

      const wool = (bodyCatalogue.categories || []).find(category => category.name === BODY_LAUNCH_CATEGORY);
      if (wool) registerSection(wool, 'textiles', 'body', SOURCES.body);

      const candles = (bodyCatalogue.categories || []).find(category => category.name === BODY_PREVIEW_CATEGORY);
      if (candles) registerSection(candles, 'preview', 'body', SOURCES.body);

      const sellableCount = state.sections.filter(section => section.kind !== 'preview').reduce((sum, section) => sum + categoryCount(section.category), 0);
      const previewCount = state.sections.filter(section => section.kind === 'preview').reduce((sum, section) => sum + categoryCount(section.category), 0);
      status.textContent = `${sellableCount} launch products loaded${previewCount ? ` · ${previewCount} candle products shown as non-sale preview` : ''}.`;
      render();
    } catch (error) {
      console.error(error);
      status.textContent = 'The catalogue snapshot could not be loaded. No products have been enabled for ordering.';
    }
  }

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
    if (event.target.closest('.dialog-close')) document.getElementById('product-dialog')?.close();
  });

  init();
})();
