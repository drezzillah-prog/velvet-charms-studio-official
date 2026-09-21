(()=>{'use strict';
const G=(title,note,items)=>({title,note,items});
const worlds={
vows:[
G('The Ceremony','Pieces used in the ceremony, designed to remain useful afterwards.',[
'Vow Books — textile, velvet, handmade-paper or leather-look covers','Ring Box — wood, ceramic or mixed-media with optional hidden message','Ring Dish','Double Ring Dish','Ceremony Keepsake Tray — later a vanity or jewellery tray','Hidden Message Ring Box','Unity Keepsake','Ceremony Program','Reserved Memory Token','One Object, One Marriage — one central custom piece that moves into the home']),
G('Paper & Letters','A paper story rather than disconnected stationery.',[
'Invitation Suite','Save the Date','Menu Cards','Place Cards','Table Numbers','Thank-You Cards','Letters to Each Other','Letters for Later — sealed anniversary/future-moment letters','Letters from the Guests','Wedding Story Booklet']),
G('The Table','Table details that can become guest keepsakes or home objects.',[
'Personalized Table Numbers','Name Tokens','Mini Trinket Dish Place Cards','Personalized Napkin Charms','Menu Holders','Centerpiece Keepsakes','Couple’s Table Piece','Story Table Numbers — places, years or moments from the relationship']),
G('For the Guests','Small pieces with a reason to survive beyond the reception.',[
'Mini Soap Favors','Mini Candle Favors — only after the candle compliance workstream is cleared','Personalized Charms','Mini Ceramic Tokens','Tiny Keepsake Boxes','Bookmarks','Message Tokens','Tiny Frames','Wedding Ornament','Mystery Favor — collectible designs distributed across the tables']),
G('People We Love','Personal thank-you pieces, not generic bridal-party merchandise.',[
'Bridesmaid Boxes','Groomsman Boxes','Maid of Honour Keepsake','Best Man Keepsake','Mother of the Bride / Groom Gift','Father of the Bride / Groom Gift','Grandparent Keepsake','Flower Girl Box','Ring Bearer Keepsake','Personalized Thank-You Object']),
G('Remembering Someone','Quiet memorial pieces integrated without turning the celebration into memorial merchandise.',[
'The Guest Who Couldn’t Be There','Memory Charm','Reserved Place Token','Hidden Memorial Message','Something of Theirs — symbolic integration assessed case by case']),
G('After the Wedding','The wedding becomes material for a later object.',[
'Wedding Time Capsule','The Last Guest Has Gone Box','Bouquet Preservation Frame','Bouquet Preservation Resin Piece','Pressed Flower Jewellery Dish','Wedding Flower Ornament','Invitation Preservation Frame','Vow Preservation Piece','First Anniversary Box','Anniversary Journal','Our Wedding Story Box','The Wedding Archaeology Box — a museum-like display of small surviving fragments from the day']),
G('Future Heirlooms','Designed to carry provenance into another generation.',[
'Future Heirloom Box','Family Wedding Archive','Generational Vow Book','The Story Underneath — hidden provenance compartment','Heirloom Ornament','Anniversary Add-On Tokens']),
G('By the Sea','The meeting point between Velvet Vows and Velvet Tides.',[
'Sea-Glass Ring Dish','Coastal Ring Box','Ivory & Sand Vow Books','Wave-Edge Place Cards','Sea-Glass Table Numbers','Coastal Menus','Seaside Welcome Sign','Coastal Guest Book','Sea-Glass Guest Favors','Coastal Bridesmaid Boxes','Beach Ceremony Memory Box','Bouquet + Shore Preservation Piece','Coordinates Wedding Keepsake','Lighthouse Wedding Ornament','Seaside Wedding Time Capsule','The Tide We Met','Our First Shore','Where We Said Yes','The Sea Was There Too']),
G('Atelier Services','Large or unusual work is quoted after scope is understood.',[
'Build Your Wedding Box','Design Your Keepsake','Wedding Atelier Consultation','Custom Wedding Story Set','Full Table Story','Custom Favors — Request a Quote','Bouquet Preservation Service','Post-Wedding Memory Service','Wedding Archaeology Service','Future Heirloom Commission'])
],
tides:[
G('Sea Glass','Translucent, pale and tactile; real or sea-glass-inspired materials are labelled honestly.',[
'Sea Glass Jewellery Dish','Sea Glass Trinket Tray','Sea Glass Coasters','Sea Glass Pendant','Sea Glass Earrings','Sea Glass Charm','Sea Glass Bookmark','Sea Glass Keychain','Sea Glass Photo Frame','Sea Glass Mirror','Sea Glass Keepsake Box','Sea Glass Candle Holder','Sea Glass Catch-All Bowl']),
G('The Shore','Forms taken from water, stone and erosion rather than nautical clichés.',[
'Wave-Edge Ceramic Tray','Shell-Inspired Ring Dish','Tidal Pool Dish','Sand Ripple Tray','Coastal Jewellery Box','Shoreline Wall Piece','Pressed Coastal Botanical Frame','Coastal Trinket Bowl','Driftwood-Inspired Photo Frame','Weathered-Wood Keepsake Box','Coastal Bookends','Shell-Form Ornament','Wave Bookmark','Coastal Desk Tray','Tiny Harbor Dish']),
G('The Lighthouse Keeper','A slightly historical, narrative coastal collection.',[
'Miniature Lighthouse','Lighthouse Keeper’s Box','Keeper’s Journal','Keeper’s Key Charm','Lighthouse Bookmark','Storm-Lantern-Inspired Decorative Piece','Tiny Keeper’s Cottage','Letter from the Lighthouse','Brass/Wood Coordinates Plaque','Lighthouse Ornament','The Last Light']),
G('After the Storm','Slate, smoke, wet wood and the coast after bad weather.',[
'Storm Sea Tray','Dark Sea Glass Dish','Weathered Wood Box','Rain on the Harbor Wall Piece','Storm Cloud Ornament','Black Sea Material Study','Broken Pier Miniature','After the Storm Keepsake','Grey Coast Frame','Found After the Storm — small mystery collection']),
G('Letters from the Coast','Objects about distance, correspondence and returning.',[
'Coastal Letter Box','Writing Set','Postcard Set','Envelope Keepsake Box','Letter Opener + Tray — subject to safe material/design review','Bookmark Collection','Letters Never Sent Keepsake','Message in a Bottle — restrained, not souvenir styling','Letter from Home','Letter from the Sea']),
G('Last Day of Summer','Warm, nostalgic pieces about a season ending.',[
'Late-Summer Photo Frame','Pressed Flower + Shore Keepsake','Sun-Warmed Ceramic Dish','Last Swim Ornament','Holiday Memory Box','Summer Ticket / Photo Archive','Vacation Time Capsule','Our Summer Coordinates','Tiny Beach House','Last Day of Summer Miniature']),
G('Black Sea Morning','An artistic Black Sea collection — never a generic Romania souvenir line.',[
'Black Sea Morning Tray','Grey-Blue Ceramic Dish','Old Constanța Window Miniature','Port Morning Miniature','Limestone + Sea Palette Objects','Black Sea Coordinates Keepsake','Old Seafront-Inspired Frame','Sea at 6 A.M. Wall Piece','Dobrogea Coastal Botanical Piece','Black Sea Memory Box']),
G('Objects of Place','Location as memory, usable well beyond seaside.',[
'Coordinates of Us','Where We Met','Where We Married','Our First Home','Where You Proposed','The Place We Return To','Our City','Our Coast','Our Map Fragment','Two Places, One Object']),
G('Pets by the Sea','A small extension for memories that include the animal family.',[
'Coastal Pet Tag','Sea-Themed Collar Charm','Our First Beach Walk Ornament','Paw + Coordinates Keepsake','Pet Seaside Portrait Frame','Tiny Felted Seaside Pet','Pet Holiday Memory Box','Wedding Pet Ring-Pouch / Charm — only in a pet-safe design','Best Dog / Best Cat Wedding Keepsake','Pet Wedding Portrait']),
G('Coastal Commissions','For places and events that need a coherent custom family rather than individual SKUs.',[
'Custom Coastal Collection for hotels, guesthouses, restaurants or events','Place-Specific Keepsake Series','Coastal Event Table Story','Custom Harbor / Lighthouse Miniature'])
],
beginnings:[
G('Before Hello','Keepsakes for anticipation without turning pregnancy into generic nursery merchandise.',[
'Letters Before Hello — sealed letters written before birth or arrival','Waiting for You Journal','The Name We Whispered — discreet name keepsake','First Photograph Archive — ultrasound/adoption referral/photo-safe presentation where appropriate','The Waiting Box — small objects and notes from the waiting period','Our Family Is Changing Ornament']),
G('The Day You Arrived','Record the day without duplicating ordinary birth announcement products.',[
'Arrival Story Box','The Day You Arrived Time Capsule','First Day Coordinates — place/date/time as a subtle design','Today the World Changed — custom wall or desk piece','Hospital Bracelet / Arrival Ephemera Archive — display solution, not alteration of originals','First Family Photograph Frame','Welcome Home Token']),
G('Tiny Evidence','The tiny physical traces that disappear fastest.',[
'First Lock Keepsake Vessel','First Tooth Keepsake Box','Hospital Tag Archive','Tiny Sock Shadow Box','First Shoes Display / Archive','Handprint or Footprint Art Commission from a supplied impression/photo','Growth Ribbon Archive — a physical height/length record designed to be kept','The Pocket of Firsts — compartment box for several tiny milestones']),
G('First Year, Not First Clutter','A few structured records instead of dozens of repetitive milestone products.',[
'Twelve Months / Twelve Objects Archive','First Year Story Book','First Birthday Time Capsule','First Year Ornament','One Photo a Month Frame or Book','The Things You Loved at One — story card + keepsake object','First Word Token','First Steps Coordinates / Date Keepsake']),
G('Becoming a Family','Inclusive of many ways a family begins.',[
'Our First Day as a Family','Adoption Day / Family Day Keepsake','The Journey Home Box','Chosen Family Archive','Two Homes, One Family — respectful dual-place keepsake','Foster-to-Family Story Commission where the customer chooses the wording','Sibling Welcome Box','Grandparent Beginning Keepsake','The Day We Met You — adaptable to birth, adoption or another family beginning']),
G('For the Child Later','Made for the future adult, not only the nursery.',[
'Open When You’re Eighteen Box','Letters for Future You','What We Want You to Know Book','Your First Home Key / Address Keepsake','Family Recipe Starter Book','Family Story Archive','The Year You Were Born Cultural Time Capsule — customer-selected personal material, not generic trivia','Future Heirloom Ornament','The Story Underneath — hidden provenance note']),
G('New Home, New Life','Beginnings are not limited to babies.',[
'First Home Coordinates Keepsake','First Key Display','The Empty Room / Before We Moved Photo Archive','New Home Time Capsule','Our First Dinner Here Keepsake','Housewarming Story Box','First Garden / First Plant Marker','The House Begins Here — custom plaque or artwork','Moving Countries / New City Keepsake','Two Cities, One Home']),
G('New Chapters','Objects for starting again without forcing a celebration narrative.',[
'New Job / New Studio Desk Token','Graduation-to-Next-Chapter Box','Starting Over Keepsake','First Day of My Own Business Archive','New Name / New Identity Keepsake — customer-led wording only','Recovery Milestone Object — non-medical, customer-defined milestone','The First Page — journal + keepsake pairing','A Door Opened — symbolic custom object']),
G('Family Rituals','Objects that gain meaning through repeated use.',[
'Birthday Letter Box — add one letter each year','Annual Height / Milestone Token Set','Family Celebration Tray','First-Day-of-School Archive','Holiday Tradition Box','Sunday Memory Book','One Object Every Year — growing heirloom series','Family Passport / Chapter Stamps — distinct from the customer loyalty Passport']),
G('Beginnings Atelier','Custom work is scoped before price or production promises.',[
'New Family Story Commission','First Year Archive Commission','Adoption / Family Day Commission','Future Heirloom Commission','Custom Time Capsule','Family Archive Design','First Home Story Commission','Milestone Object — Request a Quote'])
]};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const [world,groups] of Object.entries(worlds)){const root=document.querySelector('[data-world="'+world+'"]');if(!root)continue;root.innerHTML=groups.map(g=>'<article class="life-group"><h4>'+esc(g.title)+'</h4><p>'+esc(g.note)+'</p><ul class="idea-list">'+g.items.map(i=>'<li>'+esc(i)+'</li>').join('')+'</ul></article>').join('');}
})();