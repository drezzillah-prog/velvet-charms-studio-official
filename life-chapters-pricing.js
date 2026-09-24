(()=>{'use strict';
const P={vows:{default:59,small:29,medium:69,large:119,premium:179,service:249},tides:{default:49,small:27,medium:59,large:109,premium:159,service:249},beginnings:{default:49,small:29,medium:59,large:109,premium:159,service:249}};
function price(name,group,world){
 const s=(name+' '+group).toLowerCase(),p=P[world];
 if(/consultation/.test(s))return 75;
 if(/full table story|custom collection|archive design|archaeology service|preservation service|story commission|future heirloom commission|custom harbor/.test(s))return 249;
 if(/wedding archaeology box|family archive|generational|custom wedding story|time capsule|story box|memory box|journey home|waiting box|first year archive/.test(s))return p.premium;
 if(/miniature|wall piece|mirror|bookends|guest book|journal|vow books|writing set|photo archive|shadow box|display|ceremony keepsake tray|jewellery box|letter box|bridesmaid boxes|groomsman boxes|welcome sign/.test(s))return p.large;
 if(/tray|dish|bowl|coasters|box|book|plaque|portrait|art commission|keepsake vessel|frame|holder|invitation suite|table numbers|centerpiece|couple’s table/.test(s))return p.medium;
 if(/earrings|pendant|charm|keychain|bookmark|token|ornament|place card|napkin|tag|marker|postcard|menu cards|save the date|thank-you cards|first tooth|first lock|first word|coordinates/.test(s))return p.small;
 return p.default;
}
function decorate(root,world){root.querySelectorAll('.idea-list li').forEach(li=>{if(li.querySelector('.market-price'))return;const raw=li.textContent.trim(),name=raw.split(' — ')[0],group=li.closest('article')?.querySelector('h4,h3')?.textContent||'',span=document.createElement('span');span.className='market-price';span.textContent='From $'+price(name,group,world)+' USD';li.appendChild(span);});}
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{for(const root of document.querySelectorAll('[data-world]'))decorate(root,root.dataset.world)},40));
})();