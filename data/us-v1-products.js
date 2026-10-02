// Velvet Charms Studio USA V1 — controlled product definitions.
// Source architecture: Velvet_Charms_USA_EU_Launch_Master_Guide.docx.
// Retail fill size is kept separate from the 100 g development formula basis.
// These definitions do not modify the original Body Glow catalogue.

const prelaunch = "prelaunch";

export const US_V1_PRODUCTS = [
  { id:"us_body_butter_100", name:"Body Butter", size:"3.4 fl oz / 100 mL", formulaBatchBasis:"100 g prototype", family:"Body Butter", formulaCode:"VC-BB-001", version:"1.0", formula:[["Shea Butter, cosmetic grade",55],["Sweet Almond Oil",24],["Jojoba Oil",15],["Beeswax",5],["Tocopherol / Vitamin E",1]], positioning:"Unscented. A rich, water-free body butter made for everyday moisturizing, softening and conditioning. The dense balm-butter texture is designed for dry-feeling areas and slow, comforting body-care rituals.", launchStatus:prelaunch },
  { id:"us_face_balm_100", name:"Nourishing Face Balm", size:"1.7 fl oz / 50 mL", formulaBatchBasis:"100 g prototype", family:"Face Balm", formulaCode:"VC-FB-001", version:"1.0", formula:[["Jojoba Oil",45],["Squalane, documented cosmetic grade",25],["Shea Butter",20],["Beeswax",9],["Tocopherol",1]], positioning:"Unscented. A water-free face balm designed to moisturize and condition the skin with a simple, cushiony finish. Intended for customers who prefer a concentrated balm rather than a water-based cream.", launchStatus:prelaunch },
  { id:"us_hand_foot_balm_100", name:"Hand & Foot Balm", size:"1.7 fl oz / 50 mL", formulaBatchBasis:"100 g prototype", family:"Hand & Foot Balm", formulaCode:"VC-HFB-001", version:"1.0", formula:[["Shea Butter",45],["Sweet Almond Oil",25],["Jojoba Oil",15],["Beeswax",14],["Tocopherol",1]], positioning:"Unscented. A rich, water-free balm for hands and feet, designed to soften and condition dry-feeling skin and leave a comfortable, protective-feeling finish.", launchStatus:prelaunch },

  { id:"us_refill_body_butter_100", name:"Body Butter Refill", size:"3.4 fl oz / 100 mL", formulaBatchBasis:"100 g prototype", family:"Refills", formulaCode:"VC-BB-001-R", version:"1.0", formula:[["Shea Butter, cosmetic grade",55],["Sweet Almond Oil",24],["Jojoba Oil",15],["Beeswax",5],["Tocopherol / Vitamin E",1]], positioning:"Unscented. A lower-waste refill using the same Body Butter blend, created for customers who want to keep and reuse a compatible Velvet vessel.", launchStatus:prelaunch },
  { id:"us_refill_face_balm_50", name:"Nourishing Face Balm Refill", size:"1.7 fl oz / 50 mL", formulaBatchBasis:"100 g prototype", family:"Refills", formulaCode:"VC-FB-001-R", version:"1.0", formula:[["Jojoba Oil",45],["Squalane, documented cosmetic grade",25],["Shea Butter",20],["Beeswax",9],["Tocopherol",1]], positioning:"Unscented. A lower-waste refill using the same Nourishing Face Balm blend, intended for reuse with a compatible Velvet container.", launchStatus:prelaunch },
  { id:"us_refill_hand_foot_balm_50", name:"Hand & Foot Balm Refill", size:"1.7 fl oz / 50 mL", formulaBatchBasis:"100 g prototype", family:"Refills", formulaCode:"VC-HFB-001-R", version:"1.0", formula:[["Shea Butter",45],["Sweet Almond Oil",25],["Jojoba Oil",15],["Beeswax",14],["Tocopherol",1]], positioning:"Unscented. A lower-waste refill using the same Hand & Foot Balm blend, created for customers who want to keep the original vessel in use.", launchStatus:prelaunch },

  { id:"us_solid_perfume_ivory_hour", name:"Solid Perfume — IVORY HOUR", size:"Net Wt. 0.18 oz / 5 g · Net Wt. 0.35 oz / 10 g", family:"Velvet Fragrance", formulaCode:"VC-SP-IH-DEV", version:"fragrance-development", formula:null, positioning:"Clean, luminous and quietly luxurious. A portable solid fragrance built around the IVORY HOUR scent story, designed for subtle reapplication and a soft, skin-close scent experience.", launchStatus:prelaunch, fragranceGate:true, sizeOptions:["Net Wt. 0.18 oz / 5 g","Net Wt. 0.35 oz / 10 g"], studioImages:["/assets/solid-perfume-ivory-hour.svg"] },
  { id:"us_solid_perfume_veiled", name:"Solid Perfume — VEILED", size:"Net Wt. 0.18 oz / 5 g · Net Wt. 0.35 oz / 10 g", family:"Velvet Fragrance", formulaCode:"VC-SP-VL-DEV", version:"fragrance-development", formula:null, positioning:"Feminine, mysterious and refined. A portable solid fragrance translating VEILED into a compact format for soft, intimate reapplication throughout the day.", launchStatus:prelaunch, fragranceGate:true, sizeOptions:["Net Wt. 0.18 oz / 5 g","Net Wt. 0.35 oz / 10 g"], studioImages:["/assets/solid-perfume-veiled.svg"] },
  { id:"us_solid_perfume_black_honey", name:"Solid Perfume — BLACK HONEY", size:"Net Wt. 0.18 oz / 5 g · Net Wt. 0.35 oz / 10 g", family:"Velvet Fragrance", formulaCode:"VC-SP-BH-DEV", version:"fragrance-development", formula:null, positioning:"Dark, sensual and warm. A compact solid fragrance built around BLACK HONEY's woody-vanilla mood, designed to stay close to the skin rather than project like a spray.", launchStatus:prelaunch, fragranceGate:true, sizeOptions:["Net Wt. 0.18 oz / 5 g","Net Wt. 0.35 oz / 10 g"], studioImages:["/assets/solid-perfume-black-honey.svg"] },
  { id:"us_solid_perfume_sacred_smoke", name:"Solid Perfume — SACRED SMOKE", size:"Net Wt. 0.18 oz / 5 g · Net Wt. 0.35 oz / 10 g", family:"Velvet Fragrance", formulaCode:"VC-SP-SS-DEV", version:"fragrance-development", formula:null, positioning:"Ritualic, resinous and memorable. A portable solid fragrance built around SACRED SMOKE for customers who want something atmospheric and distinctive.", launchStatus:prelaunch, fragranceGate:true, sizeOptions:["Net Wt. 0.18 oz / 5 g","Net Wt. 0.35 oz / 10 g"], studioImages:["/assets/solid-perfume-sacred-smoke.svg"] },

  // Citrus Bloom deliberately remains outside the sellable V1 definitions until exact materials
  // and a non-phototoxic/FCF-safe percentage are frozen from supplier documentation.

  // The Master Guide deliberately does not invent a universal soap percentage. The exact
  // cosmetic-grade melt-and-pour base and compatible additive levels must come from supplier docs.
  { id:"us_soap_exfoliating", name:"Exfoliating Glycerin Soap", size:"Net Wt. 3.5 oz / 100 g", family:"Glycerin Soap", formulaCode:"VC-SOAP-EX-001", version:"supplier-dependent", formula:null, positioning:"A giftable glycerin cleansing bar with a fine coffee or oatmeal exfoliating texture for a more tactile wash.", launchStatus:prelaunch, supplierFormulaGate:true },
  { id:"us_soap_herbal", name:"Natural Herbal Glycerin Soap", size:"Net Wt. 3.5 oz / 100 g", family:"Glycerin Soap", formulaCode:"VC-SOAP-HB-001", version:"supplier-dependent", formula:null, positioning:"A botanical-inspired glycerin cleansing bar with chamomile or calendula styling and a simple, giftable presentation.", launchStatus:prelaunch, supplierFormulaGate:true },
  { id:"us_soap_flower", name:"Flower-Shaped Glycerin Soap", size:"Net Wt. 3.5 oz / 100 g", family:"Glycerin Soap", formulaCode:"VC-SOAP-FL-001", version:"supplier-dependent", formula:null, positioning:"A flower-shaped glycerin cleansing bar designed to be both useful and giftable, with decorative color and fragrance variations.", launchStatus:prelaunch, supplierFormulaGate:true },
  { id:"us_soap_fruit", name:"Fruit-Shaped Glycerin Soap", size:"Net Wt. 3.5 oz / 100 g", family:"Glycerin Soap", formulaCode:"VC-SOAP-FR-001", version:"supplier-dependent", formula:null, positioning:"A playful fruit-shaped glycerin cleansing bar created as a cheerful, giftable bathroom or guest-room detail.", launchStatus:prelaunch, supplierFormulaGate:true }
];

export const US_V1_FAMILIES = ["Body Butter","Face Balm","Hand & Foot Balm","Refills","Velvet Fragrance","Glycerin Soap"];

export function assertFormulaTotals() {
  for (const product of US_V1_PRODUCTS) {
    if (!product.formula) continue;
    const total = product.formula.reduce((sum,[,percentage]) => sum + percentage,0);
    if (Math.abs(total-100)>0.0001) throw new Error(`Formula ${product.formulaCode} totals ${total}%`);
  }
  return true;
}
