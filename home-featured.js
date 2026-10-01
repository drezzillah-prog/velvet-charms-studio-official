(() => {
  'use strict';

  const FEATURED_IDS=[
    'portrait_2d',
    'tray',
    'blanket_medium',
    'felt_family',
    'us_body_butter_100',
    'us_solid_perfume_black_honey'
  ];

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const encPath=path=>String(path||'').split('/').map(encodeURIComponent).join('/');
  const productsOf=category=>[
    ...(category.products||[]),
    ...(category.subcategories||[]).flatMap(sub=>sub.products||[])
  ];
  const money=p=>{
    const amount='$'+Number(p.price||0).toFixed(2);
    return ['made-to-order','custom-inquiry'].includes(p.availability)?'From '+amount:amount;
  };
  const label=p=>{
    if(p.availability==='coming-soon')return 'Coming soon';
    if(p.availability==='custom-inquiry')return 'Custom inquiry';
    if(p.availability==='made-to-order')return 'Made to order';
    return p.studio_family||'Velvet Charms';
  };
  const href=p=>{
    if(p.id==='us_solid_perfume_black_honey')return 'scent.html?s=black-honey';
    return 'catalogue.html?q='+encodeURIComponent(p.name);
  };

  async function load(){
    const root=document.getElementById('featured-grid');
    if(!root)return;
    try{
      const r=await fetch('/api/catalogue',{cache:'no-store'});
      if(!r.ok)throw new Error();
      const payload=await r.json();
      const items=[];
      for(const section of payload.sections||[]){
        for(const p of productsOf(section.category||{})){
          items.push({product:p,assetBase:section.assetBase||''});
        }
      }
      const byId=new Map(items.map(x=>[x.product.id,x]));
      const featured=FEATURED_IDS.map(id=>byId.get(id)).filter(Boolean);
      root.innerHTML=featured.map(({product:p,assetBase})=>{
        const first=p.images?.[0]||'';
        const src=first?(first.startsWith('/')||/^https?:\/\//i.test(first)?first:assetBase+encPath(first)):'';
        return `<article class="featured-card">
          <a class="featured-card-media" href="${esc(href(p))}" aria-label="View ${esc(p.name)}">${src?`<img src="${esc(src)}" alt="${esc(p.name)}" loading="lazy" decoding="async">`:'<div class="image-placeholder"></div>'}</a>
          <div class="featured-card-copy">
            <p class="eyebrow">${esc(label(p))}</p>
            <h3>${esc(p.name)}</h3>
            <p>${esc(p.description||'')}</p>
            <div class="featured-price">${esc(money(p))}</div>
            <a href="${esc(href(p))}">${p.availability==='coming-soon'?'Meet the scent':'View piece'} →</a>
          </div>
        </article>`;
      }).join('');
      if(!featured.length)root.innerHTML='<p>Explore the full catalogue to discover the Studio collection.</p>';
    }catch{
      root.innerHTML='<p>Explore the full catalogue to discover the Studio collection.</p>';
    }
  }

  load();
})();