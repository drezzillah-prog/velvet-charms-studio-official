(()=>{'use strict';
function band(name,group,world){
 const s=(name+' '+group).toLowerCase();
 if(/consultation|full table story|custom collection|archive design|archaeology service|preservation service|story commission|future heirloom commission/.test(s))return 899;
 if(/large|family archive|wedding archaeology box|generational|custom wedding story|time capsule|story box|memory box|keepsake box|journey home box|waiting box|last guest|first year archive/.test(s))return 449;
 if(/miniature|wall piece|frame|mirror|bookends|guest book|journal|vow books|writing set|photo archive|shadow box|display|ceremony tray|jewellery box|letter box|bridesmaid boxes|groomsman boxes/.test(s))return 299;
 if(/tray|dish|bowl|coasters|box|book|plaque|portrait|art|keepsake|vessel|holder|welcome sign|seating|table numbers|menu|stationery|invitation|ornament set/.test(s))return 199;
 if(/earrings|pendant|charm|keychain|bookmark|token|ornament|place card|napkin|tag|marker|postcard|card|first tooth|first lock|first word|coordinates/.test(s))return 99;
 if(/favors|favour/.test(s))return 79;
 if(/request a quote|commission|custom favors|custom favours/.test(s))return 699;
 return world==='vows'?179:world==='tides'?159:169;
}
function roundEur(v){return Math.max(18,Math.round(v/2)*2-1)}
function prices(ron,country){
 const base=roundEur(ron/4.05);
 const premium={DE:1.10,FR:1.12,AT:1.10,NL:1.08,BE:1.08,LU:1.15,IE:1.10,FI:1.08,IT:1.02,ES:1,PT:.96,GR:.94}[country]||1;
 return{ron,eur:roundEur(base*premium),base};
}
function usd(ron){const eu=roundEur(ron/4.05);return Math.max(24,Math.round((eu*1.38)/2)*2-1)}
function decorate(root,world,country,market){
 root.querySelectorAll('.idea-list li').forEach(li=>{if(li.querySelector('.market-price'))return;const raw=li.textContent.trim(),name=raw.split(' — ')[0],group=li.closest('article')?.querySelector('h4,h3')?.textContent||'',ron=band(name,group,world),span=document.createElement('span');span.className='market-price';
 if(market==='US')span.textContent='From $'+usd(ron)+' USD';
 else {const p=prices(ron,country);span.textContent=country==='RO'?'From '+p.ron+' RON':'From €'+p.eur+(country&&['DE','FR','AT','NL','BE','LU','IE','FI','IT','ES','PT','GR'].includes(country)?' · '+country:'');}
 li.appendChild(span);
 });
}
async function country(){try{const r=await fetch('/api/currency',{cache:'no-store'});if(r.ok)return String((await r.json()).country||'').toUpperCase()}catch{}try{return Intl.DateTimeFormat().resolvedOptions().timeZone==='Europe/Bucharest'?'RO':''}catch{return''}}
async function run(){const market=document.body.dataset.lifeMarket||'EU',c=market==='US'?'US':await country();for(const root of document.querySelectorAll('[data-world]'))decorate(root,root.dataset.world,c,market)}
document.addEventListener('DOMContentLoaded',()=>setTimeout(run,40));
})();