(() => {
  'use strict';

  const CART_KEY='velvetStudioUsCartV3';
  const CHECKOUT_KEY='velvetStudioUsCheckoutV3';
  const state={sections:[],meta:new Map(),family:'all',search:'',sort:'featured',cart:loadCart(),market:'US',status:{storeLive:false,paypalConfigured:false}};

  const $=s=>document.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const label=k=>String(k||'').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());

  function loadCart(){try{const x=JSON.parse(localStorage.getItem(CART_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
  function saveCart(){localStorage.setItem(CART_KEY,JSON.stringify(state.cart));renderCart()}
  function productsOf(c){return [...(c.products||[]).map(p=>({product:p,subcategory:''})),...(c.subcategories||[]).flatMap(s=>(s.products||[]).map(p=>({product:p,subcategory:s.name||''})))]}
  function image(meta,path){const v=String(path||'');if(v.startsWith('/')||/^https?:\/\//i.test(v))return v;return meta.assetBase+v.split('/').map(encodeURIComponent).join('/')}
  function money(p){const amount='
  function unavailable(p){return ['custom-inquiry','coming-soon'].includes(p?.availability)}
  function availabilityLabel(p){
    if(p?.availability==='coming-soon')return {text:'Coming soon',kind:'coming'};
    if(p?.availability==='custom-inquiry')return {text:'Custom inquiry',kind:'custom'};
    if(p?.availability==='made-to-order')return {text:'Made to order',kind:'made'};
    return null;
  }
  function customerFamily(p,section){return p.studio_family||section.category?.name||''}
  function inquiryHref(p){return 'contact.html?subject='+encodeURIComponent('Question about '+p.name)}
  function setActiveFilter(button){document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b===button))}
  function searchable(meta){
    const p=meta.product||{};
    return [p.name,p.description,meta.family,meta.sectionName,meta.subcategory,...Object.values(p.options||{}).flat()].filter(Boolean).join(' ').toLowerCase();
  }
  function matchesSearch(meta){
    const q=state.search.trim().toLowerCase();
    return !q||searchable(meta).includes(q);
  }
  function sortItems(items){
    const copy=[...items];
    if(state.sort==='price-low')copy.sort((a,b)=>Number(a.product.price||0)-Number(b.product.price||0));
    else if(state.sort==='price-high')copy.sort((a,b)=>Number(b.product.price||0)-Number(a.product.price||0));
    else if(state.sort==='name')copy.sort((a,b)=>String(a.product.name||'').localeCompare(String(b.product.name||'')));
    return copy;
  }

  function register(payload){
    state.market=payload.market||'US';
    state.sections=[]; state.meta=new Map();
    for(const section of payload.sections||[]){
      const normalized={...section,items:[],subgroups:new Map()};
      for(const {product,subcategory} of productsOf(section.category||{})){
        const key=`studio:${product.id}`;
        const meta={key,assetBase:section.assetBase,product,family:customerFamily(product,section),subcategory,sectionName:section.category?.name||''};
        normalized.items.push(meta);
        if(!normalized.subgroups.has(subcategory))normalized.subgroups.set(subcategory,[]);
        normalized.subgroups.get(subcategory).push(meta);
        state.meta.set(key,meta);
      }
      state.sections.push(normalized);
    }
  }

  function variantSummary(p){
    const parts=[];
    if(Array.isArray(p.options?.scent)&&p.options.scent.length)parts.push('<div class="variant-summary"><strong>Scents</strong><span>'+p.options.scent.map(esc).join(' · ')+'</span></div>');
    if(Array.isArray(p.options?.size)&&p.options.size.length)parts.push('<div class="variant-summary"><strong>Sizes</strong><span>'+p.options.size.map(esc).join(' · ')+'</span></div>');
    return parts.join('');
  }
  function thumbs(meta,dialog=false){
    const images=meta.product.images||[];
    if(images.length<2)return '';
    const attr=dialog?'data-dialog-image':'data-card-image';
    const keyAttr=dialog?'data-key':'data-card-key';
    const cls=dialog?'dialog-thumbs':'card-thumbs';
    return `<div class="${cls}">${images.slice(0,dialog?8:5).map((path,i)=>`<button type="button" ${attr}="${i}" ${keyAttr}="${esc(meta.key)}" aria-label="Show image ${i+1}"><img src="${esc(image(meta,path))}" alt="" loading="lazy"></button>`).join('')}</div>`;
  }
  function card(meta){
    const p=meta.product, first=p.images?.[0], labelInfo=availabilityLabel(p);
    return `<article class="product-card">
      <div class="card-media">
        ${first?`<img class="card-main-image" src="${esc(image(meta,first))}" alt="${esc(p.name)}" loading="lazy" decoding="async" data-open-image="${esc(meta.key)}">`:'<div class="image-placeholder"></div>'}
        ${thumbs(meta)}
      </div>
      <div class="product-body">
        <span class="badge">${esc(meta.family)}</span>
        ${labelInfo?`<span class="availability-tag ${labelInfo.kind}">${esc(labelInfo.text)}</span>`:''}
        <h3>${esc(p.name)}</h3>
        ${p.size?`<p class="product-size">${esc(p.size)}</p>`:''}
        <p>${esc(p.description||'')}</p>
        ${variantSummary(p)}
        <div class="price">${money(p)}</div>
        <div class="product-actions">
          <button class="details-btn" type="button" data-details="${esc(meta.key)}">Details</button>
          ${unavailable(p)
            ? `<a class="buy-btn inquiry-btn" href="${esc(inquiryHref(p))}">${p.availability==='coming-soon'?'Ask to be notified':'Ask about this piece'}</a>`
            : `<button class="buy-btn" type="button" data-order="${esc(meta.key)}">Choose options</button>`}
        </div>
      </div>
    </article>`;
  }
  function sectionMarkup(section){
    const filtered=sortItems(section.items.filter(m=>(state.family==='all'||m.family===state.family)&&matchesSearch(m)));
    if(!filtered.length)return '';
    const bySub=new Map();
    for(const m of filtered){
      const k=m.subcategory||'';
      if(!bySub.has(k))bySub.set(k,[]);
      bySub.get(k).push(m);
    }
    const groups=[...bySub.entries()].map(([name,items])=>`${name?`<h3 class="subcategory-title">${esc(name)}</h3>`:''}<div class="product-grid">${items.map(card).join('')}</div>`).join('');
    const count=filtered.length;
    const intro=String(section.category?.customer_intro||'').trim();
    return `<section class="category-block">
      <div class="category-heading"><div><h2>${esc(section.category?.name||'Collection')}</h2>${intro?`<p class="category-intro">${esc(intro)}</p>`:''}</div><p class="category-count">${count} ${count===1?'piece':'pieces'}</p></div>
      ${groups}
    </section>`;
  }
  function render(){
    const root=$('#catalogue-root'); if(!root)return;
    root.innerHTML=state.sections.map(sectionMarkup).join('')||'<p>No pieces match this filter.</p>';
  }

  function optionFields(p){
    const fields=Object.entries(p.options||{}).filter(([,values])=>Array.isArray(values)&&values.length).map(([key,values])=>`<label class="field"><span>${esc(label(key))}</span><select name="${esc(key)}"><option value="">Choose</option>${values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('')}</select></label>`).join('');
    return fields+`<label class="field field-wide"><span>Special instructions</span><textarea name="special_instructions" maxlength="1000" rows="4" placeholder="Tell us anything we should know about your piece."></textarea></label>`;
  }
  function openProduct(key,ordering){
    const meta=state.meta.get(key); if(!meta)return;
    const p=meta.product,d=$('#product-dialog'),c=$('#dialog-content'),first=p.images?.[0],blocked=unavailable(p),labelInfo=availabilityLabel(p);
    if(!d||!c)return;
    c.innerHTML=`<div class="dialog-wrap">
      <div class="dialog-gallery">${first?`<img class="dialog-main-image" src="${esc(image(meta,first))}" alt="${esc(p.name)}" data-lightbox-src="${esc(image(meta,first))}">`:''}${thumbs(meta,true)}</div>
      <div class="dialog-copy">
        <span class="badge">${esc(meta.family)}</span>
        ${labelInfo?`<span class="availability-tag ${labelInfo.kind}">${esc(labelInfo.text)}</span>`:''}
        <h2>${esc(p.name)}</h2>
        ${p.size?`<p class="product-size">${esc(p.size)}</p>`:''}
        <p>${esc(p.description||'')}</p>
        ${variantSummary(p)}
        <p class="price">${money(p)}</p>
        ${ordering&&!blocked?`<form id="customize-form" data-key="${esc(key)}">${optionFields(p)}<label class="field"><span>Quantity</span><input name="qty" type="number" min="1" max="20" value="1"></label><button class="btn primary full" type="submit">Add to bag</button></form>`:''}
        ${blocked?`<p><a class="btn primary" href="${esc(inquiryHref(p))}">${p.availability==='coming-soon'?'Ask to be notified':'Request details or a quote'}</a></p>`:''}
      </div>
    </div>`;
    if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','');
  }

  function add(key,qty,options){
    const meta=state.meta.get(key); if(!meta||unavailable(meta.product))return;
    const allowed=meta.product.options||{};
    for(const [k,v] of Object.entries(options||{})){if(k==='special_instructions')continue;if(!Array.isArray(allowed[k])||!allowed[k].includes(v))return}
    const sig=JSON.stringify(options||{}), existing=state.cart.find(x=>x.key===key&&JSON.stringify(x.options||{})===sig);
    if(existing)existing.qty=Math.min(20,Number(existing.qty||0)+qty); else state.cart.push({key,qty,options:options||{}});
    saveCart(); $('#product-dialog')?.close(); openCart();
  }
  function renderCart(){
    document.querySelectorAll('[data-cart-count]').forEach(e=>e.textContent=String(state.cart.reduce((n,x)=>n+(Number(x.qty)||0),0)));
    const root=$('#cart-items'),total=$('#cart-total'); if(!root||!total)return;
    const items=state.cart.map((x,i)=>({...x,i,meta:state.meta.get(x.key)})).filter(x=>x.meta&&!unavailable(x.meta.product));
    let sum=0;
    root.innerHTML=items.length?items.map(x=>{
      const unit=Number(x.meta.product.price||0); sum+=unit*Number(x.qty||0);
      const opts=Object.entries(x.options||{}).filter(([,v])=>v).map(([k,v])=>`<small>${esc(label(k))}: ${esc(v)}</small>`).join('');
      return `<div class="cart-line"><div><strong>${esc(x.meta.product.name)}</strong>${opts}</div><div class="cart-line-controls"><input aria-label="Quantity for ${esc(x.meta.product.name)}" type="number" min="1" max="20" value="${esc(x.qty)}" data-cart-qty="${x.i}"><span>$${(unit*Number(x.qty||0)).toFixed(2)}</span><button type="button" data-cart-remove="${x.i}" aria-label="Remove ${esc(x.meta.product.name)}">×</button></div></div>`;
    }).join(''):'<p class="empty-cart">Your bag is empty.</p>';
    total.textContent=`$${sum.toFixed(2)}`; updateCheckoutAvailability();
  }
  function updateCheckoutAvailability(){
    state.cart=state.cart.filter(x=>{const m=state.meta.get(x.key);return m&&!unavailable(m.product)});
    localStorage.setItem(CART_KEY,JSON.stringify(state.cart));
    const button=$('#checkout-btn'),status=$('#checkout-status'); if(!button)return;
    let msg='';
    if(state.market!=='US')msg='This shop currently ships within the United States.';
    else if(state.cart.length&&!state.status.storeLive)msg='Online checkout is temporarily unavailable. Please contact us if you would like help with an order.';
    else if(state.cart.length&&!state.status.paypalConfigured)msg='Online payment is temporarily unavailable. Please contact us if you would like help with an order.';
    button.disabled=!state.cart.length||!!msg; if(status)status.textContent=msg;
  }
  function openCart(){document.body.classList.add('cart-open');$('#cart-drawer')?.classList.add('open');$('#cart-backdrop')?.classList.add('open')}
  function closeCart(){document.body.classList.remove('cart-open');$('#cart-drawer')?.classList.remove('open');$('#cart-backdrop')?.classList.remove('open')}
  async function loadStatus(){try{const r=await fetch('/api/store-status',{cache:'no-store'}),x=await r.json();state.status={storeLive:!!x.storeLive,paypalConfigured:!!x.paypalConfigured}}catch{}updateCheckoutAvailability()}
  async function loadCatalogue(){
    const status=$('#catalogue-status');
    try{
      const r=await fetch('/api/catalogue',{cache:'no-store'});if(!r.ok)throw Error();
      const payload=await r.json();register(payload);render();renderCart();
      if(status)status.textContent=`${state.meta.size} pieces · USD`;
    }catch{if(status)status.textContent="We couldn't load the collection. Please refresh the page or contact us."}
  }
  function checkoutCart(){return{items:state.cart.map(({key,qty,options})=>({key,qty,options})),requiredByDate:$('#required-by-date')?.value||''}}
  async function checkout(){
    const button=$('#checkout-btn'),status=$('#checkout-status');if(button?.disabled)return;
    try{
      button.disabled=true;const cart=checkoutCart();
      const r=await fetch('/api/create-order',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({cart})}),x=await r.json();
      if(!r.ok)throw Error(x.error||'Checkout is unavailable right now.');
      if(!x.orderID||!x.approveUrl)throw Error('Payment approval could not be prepared.');
      sessionStorage.setItem(CHECKOUT_KEY,JSON.stringify({cart,orderID:x.orderID}));location.href=x.approveUrl;
    }catch(e){if(status)status.textContent=e.message||'Checkout is unavailable right now.';if(button)button.disabled=false}
  }
  async function handlePaymentReturn(){
    const q=new URLSearchParams(location.search),payment=q.get('payment'),banner=$('#payment-banner');
    if(payment==='cancelled'){sessionStorage.removeItem(CHECKOUT_KEY);if(banner){banner.hidden=false;banner.textContent='Payment was cancelled. Your bag is still here.'}history.replaceState({},'',location.pathname);return}
    if(payment!=='success')return;
    let saved;try{saved=JSON.parse(sessionStorage.getItem(CHECKOUT_KEY)||'null')}catch{}
    const token=q.get('token');
    if(!saved?.cart||!saved?.orderID||!token||token!==saved.orderID){if(banner){banner.hidden=false;banner.textContent='We could not match this payment return to your bag. Please contact us with your PayPal reference.'}return}
    if(banner){banner.hidden=false;banner.textContent='Confirming your payment…'}
    try{
      const r=await fetch('/api/capture-order',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({orderID:saved.orderID,cart:saved.cart})}),x=await r.json();
      if(!r.ok||x.status!=='COMPLETED')throw Error(x.error||'Payment could not be confirmed.');
      state.cart=[];localStorage.removeItem(CART_KEY);sessionStorage.removeItem(CHECKOUT_KEY);renderCart();
      if(banner)banner.textContent=`Payment confirmed. Order ${esc(x.orderID)} has been completed securely.`;
      history.replaceState({},'',location.pathname);
    }catch(e){if(banner)banner.textContent=e.message||'Payment could not be confirmed. Please contact us before trying again.'}
  }
  function lightbox(src,alt){
    let l=$('#image-lightbox');
    if(!l){l=document.createElement('div');l.id='image-lightbox';l.className='image-lightbox';l.innerHTML='<button class="lightbox-close" type="button" aria-label="Close image">×</button><img alt="">';document.body.appendChild(l)}
    l.querySelector('img').src=src;l.querySelector('img').alt=alt||'Product image';l.classList.add('open');
  }

  document.addEventListener('click',e=>{
    const t=e.target.closest('button,[data-open-image],[data-lightbox-src]');if(!t)return;
    if(t.matches('[data-open-cart]'))openCart();
    else if(t.matches('[data-close-cart]')||t.id==='cart-backdrop')closeCart();
    else if(t.dataset.details)openProduct(t.dataset.details,false);
    else if(t.dataset.order)openProduct(t.dataset.order,true);
    else if(t.dataset.family!==undefined){state.family=t.dataset.family;setActiveFilter(t);render();const n=[...state.meta.values()].filter(m=>(state.family==='all'||m.family===state.family)&&matchesSearch(m)).length;const st=$('#catalogue-status');if(st)st.textContent=`${n} ${n===1?'piece':'pieces'} · USD`}
    else if(t.dataset.filter==='all'){state.family='all';setActiveFilter(t);render();const st=$('#catalogue-status');if(st)st.textContent=`${state.meta.size} pieces · USD`}
    else if(t.classList.contains('dialog-close'))$('#product-dialog')?.close();
    else if(t.classList.contains('lightbox-close'))$('#image-lightbox')?.classList.remove('open');
    else if(t.dataset.openImage){const m=state.meta.get(t.dataset.openImage),p=m?.product.images?.[0];if(p)lightbox(image(m,p),m.product.name)}
    else if(t.dataset.cardImage!==undefined){const m=state.meta.get(t.dataset.cardKey),src=m?.product.images?.[Number(t.dataset.cardImage)],card=t.closest('.card-media')?.querySelector('.card-main-image');if(src&&card){card.src=image(m,src);card.dataset.openImage=m.key}}
    else if(t.dataset.dialogImage!==undefined){const m=state.meta.get(t.dataset.key),src=m?.product.images?.[Number(t.dataset.dialogImage)],main=$('.dialog-main-image');if(src&&main){main.src=image(m,src);main.dataset.lightboxSrc=image(m,src)}}
    else if(t.dataset.lightboxSrc)lightbox(t.dataset.lightboxSrc,t.alt||'Product image');
    else if(t.dataset.cartRemove!==undefined){state.cart.splice(Number(t.dataset.cartRemove),1);saveCart()}
  });
  document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;closeCart();$('#product-dialog')?.close();$('#image-lightbox')?.classList.remove('open')});
  document.addEventListener('change',e=>{
    if(e.target.dataset.cartQty!==undefined){const x=state.cart[Number(e.target.dataset.cartQty)];if(x){x.qty=Math.max(1,Math.min(20,parseInt(e.target.value)||1));saveCart();return}}
    if(e.target.id==='catalogue-sort'){state.sort=e.target.value||'featured';render()}
  });
  document.addEventListener('input',e=>{
    if(e.target.id!=='catalogue-search')return;
    state.search=e.target.value||'';
    render();
    const count=[...state.meta.values()].filter(m=>(state.family==='all'||m.family===state.family)&&matchesSearch(m)).length;
    const status=$('#catalogue-status');
    if(status)status.textContent=state.search.trim()?`${count} matching ${count===1?'piece':'pieces'}`:`${state.meta.size} pieces · USD`;
  });
  document.addEventListener('submit',e=>{if(e.target.id!=='customize-form')return;e.preventDefault();const f=new FormData(e.target),o={};for(const [k,v] of f)if(k!=='qty'&&String(v).trim())o[k]=String(v).trim();add(e.target.dataset.key,Math.max(1,Math.min(20,parseInt(f.get('qty'))||1)),o)});
  $('#checkout-btn')?.addEventListener('click',checkout);
  loadCatalogue();loadStatus();handlePaymentReturn();
})();+Number(p.price||0).toFixed(2);return p?.__made_to_order||p?.__inquiry_only?'From '+amount:amount}
  function unavailable(p){return !!(p?.__inquiry_only||p?.__supplier_formula_gate||p?.__fragrance_gate)}
  function availabilityLabel(p){
    if(p?.__fragrance_gate||p?.__supplier_formula_gate)return {text:'Coming soon',kind:'coming'};
    if(p?.__inquiry_only)return {text:'Custom inquiry',kind:'custom'};
    if(p?.__made_to_order)return {text:'Made to order',kind:'made'};
    return null;
  }
  function customerFamily(p,section){return p.studio_family||section.category?.name||''}
  function inquiryHref(p){return 'contact.html?subject='+encodeURIComponent('Question about '+p.name)}
  function setActiveFilter(button){document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b===button))}
  function searchable(meta){
    const p=meta.product||{};
    return [p.name,p.description,meta.family,meta.sectionName,meta.subcategory,...Object.values(p.options||{}).flat()].filter(Boolean).join(' ').toLowerCase();
  }
  function matchesSearch(meta){
    const q=state.search.trim().toLowerCase();
    return !q||searchable(meta).includes(q);
  }
  function sortItems(items){
    const copy=[...items];
    if(state.sort==='price-low')copy.sort((a,b)=>Number(a.product.price||0)-Number(b.product.price||0));
    else if(state.sort==='price-high')copy.sort((a,b)=>Number(b.product.price||0)-Number(a.product.price||0));
    else if(state.sort==='name')copy.sort((a,b)=>String(a.product.name||'').localeCompare(String(b.product.name||'')));
    return copy;
  }

  function register(payload){
    state.market=payload.market||'US';
    state.sections=[]; state.meta=new Map();
    for(const section of payload.sections||[]){
      const normalized={...section,items:[],subgroups:new Map()};
      for(const {product,subcategory} of productsOf(section.category||{})){
        const key=`studio:${product.id}`;
        const meta={key,assetBase:section.assetBase,product,family:customerFamily(product,section),subcategory,sectionName:section.category?.name||''};
        normalized.items.push(meta);
        if(!normalized.subgroups.has(subcategory))normalized.subgroups.set(subcategory,[]);
        normalized.subgroups.get(subcategory).push(meta);
        state.meta.set(key,meta);
      }
      state.sections.push(normalized);
    }
  }

  function variantSummary(p){
    const parts=[];
    if(Array.isArray(p.options?.scent)&&p.options.scent.length)parts.push('<div class="variant-summary"><strong>Scents</strong><span>'+p.options.scent.map(esc).join(' · ')+'</span></div>');
    if(Array.isArray(p.options?.size)&&p.options.size.length)parts.push('<div class="variant-summary"><strong>Sizes</strong><span>'+p.options.size.map(esc).join(' · ')+'</span></div>');
    return parts.join('');
  }
  function thumbs(meta,dialog=false){
    const images=meta.product.images||[];
    if(images.length<2)return '';
    const attr=dialog?'data-dialog-image':'data-card-image';
    const keyAttr=dialog?'data-key':'data-card-key';
    const cls=dialog?'dialog-thumbs':'card-thumbs';
    return `<div class="${cls}">${images.slice(0,dialog?8:5).map((path,i)=>`<button type="button" ${attr}="${i}" ${keyAttr}="${esc(meta.key)}" aria-label="Show image ${i+1}"><img src="${esc(image(meta,path))}" alt="" loading="lazy"></button>`).join('')}</div>`;
  }
  function card(meta){
    const p=meta.product, first=p.images?.[0], labelInfo=availabilityLabel(p);
    return `<article class="product-card">
      <div class="card-media">
        ${first?`<img class="card-main-image" src="${esc(image(meta,first))}" alt="${esc(p.name)}" loading="lazy" decoding="async" data-open-image="${esc(meta.key)}">`:'<div class="image-placeholder"></div>'}
        ${thumbs(meta)}
      </div>
      <div class="product-body">
        <span class="badge">${esc(meta.family)}</span>
        ${labelInfo?`<span class="availability-tag ${labelInfo.kind}">${esc(labelInfo.text)}</span>`:''}
        <h3>${esc(p.name)}</h3>
        ${p.size?`<p class="product-size">${esc(p.size)}</p>`:''}
        <p>${esc(p.description||'')}</p>
        ${variantSummary(p)}
        <div class="price">${money(p)}</div>
        <div class="product-actions">
          <button class="details-btn" type="button" data-details="${esc(meta.key)}">Details</button>
          ${unavailable(p)
            ? `<a class="buy-btn inquiry-btn" href="${esc(inquiryHref(p))}">${p.availability==='coming-soon'?'Ask to be notified':'Ask about this piece'}</a>`
            : `<button class="buy-btn" type="button" data-order="${esc(meta.key)}">Choose options</button>`}
        </div>
      </div>
    </article>`;
  }
  function sectionMarkup(section){
    const filtered=sortItems(section.items.filter(m=>(state.family==='all'||m.family===state.family)&&matchesSearch(m)));
    if(!filtered.length)return '';
    const bySub=new Map();
    for(const m of filtered){
      const k=m.subcategory||'';
      if(!bySub.has(k))bySub.set(k,[]);
      bySub.get(k).push(m);
    }
    const groups=[...bySub.entries()].map(([name,items])=>`${name?`<h3 class="subcategory-title">${esc(name)}</h3>`:''}<div class="product-grid">${items.map(card).join('')}</div>`).join('');
    const count=filtered.length;
    const intro=String(section.category?.customer_intro||'').trim();
    return `<section class="category-block">
      <div class="category-heading"><div><h2>${esc(section.category?.name||'Collection')}</h2>${intro?`<p class="category-intro">${esc(intro)}</p>`:''}</div><p class="category-count">${count} ${count===1?'piece':'pieces'}</p></div>
      ${groups}
    </section>`;
  }
  function render(){
    const root=$('#catalogue-root'); if(!root)return;
    root.innerHTML=state.sections.map(sectionMarkup).join('')||'<p>No pieces match this filter.</p>';
  }

  function optionFields(p){
    const fields=Object.entries(p.options||{}).filter(([,values])=>Array.isArray(values)&&values.length).map(([key,values])=>`<label class="field"><span>${esc(label(key))}</span><select name="${esc(key)}"><option value="">Choose</option>${values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('')}</select></label>`).join('');
    return fields+`<label class="field field-wide"><span>Special instructions</span><textarea name="special_instructions" maxlength="1000" rows="4" placeholder="Tell us anything we should know about your piece."></textarea></label>`;
  }
  function openProduct(key,ordering){
    const meta=state.meta.get(key); if(!meta)return;
    const p=meta.product,d=$('#product-dialog'),c=$('#dialog-content'),first=p.images?.[0],blocked=unavailable(p),labelInfo=availabilityLabel(p);
    if(!d||!c)return;
    c.innerHTML=`<div class="dialog-wrap">
      <div class="dialog-gallery">${first?`<img class="dialog-main-image" src="${esc(image(meta,first))}" alt="${esc(p.name)}" data-lightbox-src="${esc(image(meta,first))}">`:''}${thumbs(meta,true)}</div>
      <div class="dialog-copy">
        <span class="badge">${esc(meta.family)}</span>
        ${labelInfo?`<span class="availability-tag ${labelInfo.kind}">${esc(labelInfo.text)}</span>`:''}
        <h2>${esc(p.name)}</h2>
        ${p.size?`<p class="product-size">${esc(p.size)}</p>`:''}
        <p>${esc(p.description||'')}</p>
        ${variantSummary(p)}
        <p class="price">${money(p)}</p>
        ${ordering&&!blocked?`<form id="customize-form" data-key="${esc(key)}">${optionFields(p)}<label class="field"><span>Quantity</span><input name="qty" type="number" min="1" max="20" value="1"></label><button class="btn primary full" type="submit">Add to bag</button></form>`:''}
        ${blocked?`<p><a class="btn primary" href="${esc(inquiryHref(p))}">${p.availability==='coming-soon'?'Ask to be notified':'Request details or a quote'}</a></p>`:''}
      </div>
    </div>`;
    if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','');
  }

  function add(key,qty,options){
    const meta=state.meta.get(key); if(!meta||unavailable(meta.product))return;
    const allowed=meta.product.options||{};
    for(const [k,v] of Object.entries(options||{})){if(k==='special_instructions')continue;if(!Array.isArray(allowed[k])||!allowed[k].includes(v))return}
    const sig=JSON.stringify(options||{}), existing=state.cart.find(x=>x.key===key&&JSON.stringify(x.options||{})===sig);
    if(existing)existing.qty=Math.min(20,Number(existing.qty||0)+qty); else state.cart.push({key,qty,options:options||{}});
    saveCart(); $('#product-dialog')?.close(); openCart();
  }
  function renderCart(){
    document.querySelectorAll('[data-cart-count]').forEach(e=>e.textContent=String(state.cart.reduce((n,x)=>n+(Number(x.qty)||0),0)));
    const root=$('#cart-items'),total=$('#cart-total'); if(!root||!total)return;
    const items=state.cart.map((x,i)=>({...x,i,meta:state.meta.get(x.key)})).filter(x=>x.meta&&!unavailable(x.meta.product));
    let sum=0;
    root.innerHTML=items.length?items.map(x=>{
      const unit=Number(x.meta.product.price||0); sum+=unit*Number(x.qty||0);
      const opts=Object.entries(x.options||{}).filter(([,v])=>v).map(([k,v])=>`<small>${esc(label(k))}: ${esc(v)}</small>`).join('');
      return `<div class="cart-line"><div><strong>${esc(x.meta.product.name)}</strong>${opts}</div><div class="cart-line-controls"><input aria-label="Quantity for ${esc(x.meta.product.name)}" type="number" min="1" max="20" value="${esc(x.qty)}" data-cart-qty="${x.i}"><span>$${(unit*Number(x.qty||0)).toFixed(2)}</span><button type="button" data-cart-remove="${x.i}" aria-label="Remove ${esc(x.meta.product.name)}">×</button></div></div>`;
    }).join(''):'<p class="empty-cart">Your bag is empty.</p>';
    total.textContent=`$${sum.toFixed(2)}`; updateCheckoutAvailability();
  }
  function updateCheckoutAvailability(){
    state.cart=state.cart.filter(x=>{const m=state.meta.get(x.key);return m&&!unavailable(m.product)});
    localStorage.setItem(CART_KEY,JSON.stringify(state.cart));
    const button=$('#checkout-btn'),status=$('#checkout-status'); if(!button)return;
    let msg='';
    if(state.market!=='US')msg='This shop currently ships within the United States.';
    else if(state.cart.length&&!state.status.storeLive)msg='Online checkout is temporarily unavailable. Please contact us if you would like help with an order.';
    else if(state.cart.length&&!state.status.paypalConfigured)msg='Online payment is temporarily unavailable. Please contact us if you would like help with an order.';
    button.disabled=!state.cart.length||!!msg; if(status)status.textContent=msg;
  }
  function openCart(){document.body.classList.add('cart-open');$('#cart-drawer')?.classList.add('open');$('#cart-backdrop')?.classList.add('open')}
  function closeCart(){document.body.classList.remove('cart-open');$('#cart-drawer')?.classList.remove('open');$('#cart-backdrop')?.classList.remove('open')}
  async function loadStatus(){try{const r=await fetch('/api/store-status',{cache:'no-store'}),x=await r.json();state.status={storeLive:!!x.storeLive,paypalConfigured:!!x.paypalConfigured}}catch{}updateCheckoutAvailability()}
  async function loadCatalogue(){
    const status=$('#catalogue-status');
    try{
      const r=await fetch('/api/catalogue',{cache:'no-store'});if(!r.ok)throw Error();
      const payload=await r.json();register(payload);render();renderCart();
      if(status)status.textContent=`${state.meta.size} pieces · USD`;
    }catch{if(status)status.textContent="We couldn't load the collection. Please refresh the page or contact us."}
  }
  function checkoutCart(){return{items:state.cart.map(({key,qty,options})=>({key,qty,options})),requiredByDate:$('#required-by-date')?.value||''}}
  async function checkout(){
    const button=$('#checkout-btn'),status=$('#checkout-status');if(button?.disabled)return;
    try{
      button.disabled=true;const cart=checkoutCart();
      const r=await fetch('/api/create-order',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({cart})}),x=await r.json();
      if(!r.ok)throw Error(x.error||'Checkout is unavailable right now.');
      if(!x.orderID||!x.approveUrl)throw Error('Payment approval could not be prepared.');
      sessionStorage.setItem(CHECKOUT_KEY,JSON.stringify({cart,orderID:x.orderID}));location.href=x.approveUrl;
    }catch(e){if(status)status.textContent=e.message||'Checkout is unavailable right now.';if(button)button.disabled=false}
  }
  async function handlePaymentReturn(){
    const q=new URLSearchParams(location.search),payment=q.get('payment'),banner=$('#payment-banner');
    if(payment==='cancelled'){sessionStorage.removeItem(CHECKOUT_KEY);if(banner){banner.hidden=false;banner.textContent='Payment was cancelled. Your bag is still here.'}history.replaceState({},'',location.pathname);return}
    if(payment!=='success')return;
    let saved;try{saved=JSON.parse(sessionStorage.getItem(CHECKOUT_KEY)||'null')}catch{}
    const token=q.get('token');
    if(!saved?.cart||!saved?.orderID||!token||token!==saved.orderID){if(banner){banner.hidden=false;banner.textContent='We could not match this payment return to your bag. Please contact us with your PayPal reference.'}return}
    if(banner){banner.hidden=false;banner.textContent='Confirming your payment…'}
    try{
      const r=await fetch('/api/capture-order',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({orderID:saved.orderID,cart:saved.cart})}),x=await r.json();
      if(!r.ok||x.status!=='COMPLETED')throw Error(x.error||'Payment could not be confirmed.');
      state.cart=[];localStorage.removeItem(CART_KEY);sessionStorage.removeItem(CHECKOUT_KEY);renderCart();
      if(banner)banner.textContent=`Payment confirmed. Order ${esc(x.orderID)} has been completed securely.`;
      history.replaceState({},'',location.pathname);
    }catch(e){if(banner)banner.textContent=e.message||'Payment could not be confirmed. Please contact us before trying again.'}
  }
  function lightbox(src,alt){
    let l=$('#image-lightbox');
    if(!l){l=document.createElement('div');l.id='image-lightbox';l.className='image-lightbox';l.innerHTML='<button class="lightbox-close" type="button" aria-label="Close image">×</button><img alt="">';document.body.appendChild(l)}
    l.querySelector('img').src=src;l.querySelector('img').alt=alt||'Product image';l.classList.add('open');
  }

  document.addEventListener('click',e=>{
    const t=e.target.closest('button,[data-open-image],[data-lightbox-src]');if(!t)return;
    if(t.matches('[data-open-cart]'))openCart();
    else if(t.matches('[data-close-cart]')||t.id==='cart-backdrop')closeCart();
    else if(t.dataset.details)openProduct(t.dataset.details,false);
    else if(t.dataset.order)openProduct(t.dataset.order,true);
    else if(t.dataset.family!==undefined){state.family=t.dataset.family;setActiveFilter(t);render()}
    else if(t.dataset.filter==='all'){state.family='all';setActiveFilter(t);render()}
    else if(t.classList.contains('dialog-close'))$('#product-dialog')?.close();
    else if(t.classList.contains('lightbox-close'))$('#image-lightbox')?.classList.remove('open');
    else if(t.dataset.openImage){const m=state.meta.get(t.dataset.openImage),p=m?.product.images?.[0];if(p)lightbox(image(m,p),m.product.name)}
    else if(t.dataset.cardImage!==undefined){const m=state.meta.get(t.dataset.cardKey),src=m?.product.images?.[Number(t.dataset.cardImage)],card=t.closest('.card-media')?.querySelector('.card-main-image');if(src&&card){card.src=image(m,src);card.dataset.openImage=m.key}}
    else if(t.dataset.dialogImage!==undefined){const m=state.meta.get(t.dataset.key),src=m?.product.images?.[Number(t.dataset.dialogImage)],main=$('.dialog-main-image');if(src&&main){main.src=image(m,src);main.dataset.lightboxSrc=image(m,src)}}
    else if(t.dataset.lightboxSrc)lightbox(t.dataset.lightboxSrc,t.alt||'Product image');
    else if(t.dataset.cartRemove!==undefined){state.cart.splice(Number(t.dataset.cartRemove),1);saveCart()}
  });
  document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;closeCart();$('#product-dialog')?.close();$('#image-lightbox')?.classList.remove('open')});
  document.addEventListener('change',e=>{
    if(e.target.dataset.cartQty!==undefined){const x=state.cart[Number(e.target.dataset.cartQty)];if(x){x.qty=Math.max(1,Math.min(20,parseInt(e.target.value)||1));saveCart();return}}
    if(e.target.id==='catalogue-sort'){state.sort=e.target.value||'featured';render()}
  });
  document.addEventListener('input',e=>{
    if(e.target.id!=='catalogue-search')return;
    state.search=e.target.value||'';
    render();
    const count=[...state.meta.values()].filter(m=>(state.family==='all'||m.family===state.family)&&matchesSearch(m)).length;
    const status=$('#catalogue-status');
    if(status)status.textContent=state.search.trim()?`${count} matching ${count===1?'piece':'pieces'}`:`${state.meta.size} pieces · USD`;
  });
  document.addEventListener('submit',e=>{if(e.target.id!=='customize-form')return;e.preventDefault();const f=new FormData(e.target),o={};for(const [k,v] of f)if(k!=='qty'&&String(v).trim())o[k]=String(v).trim();add(e.target.dataset.key,Math.max(1,Math.min(20,parseInt(f.get('qty'))||1)),o)});
  $('#checkout-btn')?.addEventListener('click',checkout);
  loadCatalogue();loadStatus();handlePaymentReturn();
})();