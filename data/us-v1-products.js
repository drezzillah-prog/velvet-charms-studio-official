// Velvet Charms Studio USA V1 — controlled product definitions.
// Source: Velvet_Charms_USA_EU_Launch_Master_Guide.docx (16 Sep 2026).
// Retail fill size is kept separate from the 100 g development formula basis.
// These definitions do not modify the original Body Glow catalogue.

const prelaunch = "prelaunch";

export const US_V1_PRODUCTS = [
  { id:"us_body_butter_100", name:"Body Butter", size:"100 ml", formulaBatchBasis:"100 g prototype", family:"Body Butter", formulaCode:"VC-BB-001", version:"1.0", formula:[["Shea Butter, cosmetic grade",55],["Sweet Almond Oil",24],["Jojoba Oil",15],["Beeswax",5],["Tocopherol / Vitamin E",1]], positioning:"Rich, water-free body butter designed to moisturize, soften and condition the skin.", launchStatus:prelaunch },
  { id:"us_face_balm_100", name:"Nourishing Face Balm", size:"50 ml", formulaBatchBasis:"100 g prototype", family:"Face Balm", formulaCode:"VC-FB-001", version:"1.0", formula:[["Jojoba Oil",45],["Squalane, documented cosmetic grade",25],["Shea Butter",20],["Beeswax",9],["Tocopherol",1]], positioning:"Simple unscented face balm with cosmetic moisturization and conditioning positioning.", launchStatus:prelaunch },
  { id:"us_hand_foot_balm_100", name:"Hand & Foot Balm", size:"50 ml", formulaBatchBasis:"100 g prototype", family:"Hand & Foot Balm", formulaCode:"VC-HFB-001", version:"1.0", formula:[["Shea Butter",45],["Sweet Almond Oil",25],["Jojoba Oil",15],["Beeswax",14],["Tocopherol",1]], positioning:"Rich, water-free balm designed to moisturize, soften and condition hands and feet.", launchStatus:prelaunch },

  { id:"us_solid_perfume_vanilla_orchid", name:"Solid Perfume — Vanilla Orchid", size:"50 ml", formulaBatchBasis:"100 g prototype", family:"Solid Perfume", formulaCode:"VC-SP-VO-001", version:"1.0", formula:[["Jojoba Oil",48],["Sweet Almond Oil",20],["Shea Butter",15],["Beeswax",10],["Vanilla aromatic material",4],["Ylang-ylang",1.5],["Sandalwood material",1],["Benzoin material",0.5]], positioning:"Creamy vanilla, soft exotic floral and gentle wood fragrance for the skin.", launchStatus:prelaunch, fragranceGate:true },
  { id:"us_solid_perfume_amber_wood", name:"Solid Perfume — Amber Wood", size:"50 ml", formulaBatchBasis:"100 g prototype", family:"Solid Perfume", formulaCode:"VC-SP-AW-001", version:"1.0", formula:[["Jojoba Oil",49],["Sweet Almond Oil",20],["Shea Butter",15],["Beeswax",10],["Cedarwood",2],["Sandalwood material",1.5],["Benzoin material",2],["Vanilla aromatic material",0.5]], positioning:"Warm, resinous and woody fragrance for the skin.", launchStatus:prelaunch, fragranceGate:true },
  { id:"us_solid_perfume_sandalwood_rose", name:"Solid Perfume — Sandalwood Rose", size:"50 ml", formulaBatchBasis:"100 g prototype", family:"Solid Perfume", formulaCode:"VC-SP-SR-001", version:"1.0", formula:[["Jojoba Oil",49],["Sweet Almond Oil",20],["Shea Butter",15],["Beeswax",10],["Sandalwood material",3],["Rose material",2],["Geranium",0.75],["Vanilla aromatic material",0.25]], positioning:"A floral-wood fragrance for the skin.", launchStatus:prelaunch, fragranceGate:true },
  { id:"us_solid_perfume_white_musk", name:"Solid Perfume — White Musk", size:"50 ml", formulaBatchBasis:"100 g prototype", family:"Solid Perfume", formulaCode:"VC-SP-WM-001", version:"1.0", formula:[["Jojoba Oil",50],["Sweet Almond Oil",20],["Shea Butter",15],["Beeswax",10],["Documented White Musk fragrance composition",5]], positioning:"Soft musk fragrance for the skin.", launchStatus:prelaunch, fragranceGate:true },

  { id:"us_rollon_lavender_mist", name:"Perfume Oil Roll-On — Lavender Mist", size:"10 ml", formulaBatchBasis:"100 g prototype", family:"Perfume Oil Roll-On", formulaCode:"VC-RO-LM-001", version:"1.0", formula:[["Jojoba Oil",96],["Lavender",3],["Sandalwood material",0.5],["Vanilla aromatic material",0.5]], positioning:"Oil perfume designed to fragrance the skin.", launchStatus:prelaunch, fragranceGate:true },
  { id:"us_rollon_cedar_amber", name:"Perfume Oil Roll-On — Cedar & Amber", size:"10 ml", formulaBatchBasis:"100 g prototype", family:"Perfume Oil Roll-On", formulaCode:"VC-RO-CA-001", version:"1.0", formula:[["Jojoba Oil",95],["Cedarwood",2],["Sandalwood material",1],["Benzoin material",1.5],["Vanilla aromatic material",0.5]], positioning:"Oil perfume designed to fragrance the skin.", launchStatus:prelaunch, fragranceGate:true },
  { id:"us_rollon_floral_spice", name:"Perfume Oil Roll-On — Floral Spice", size:"10 ml", formulaBatchBasis:"100 g prototype", family:"Perfume Oil Roll-On", formulaCode:"VC-RO-FS-001", version:"1.0", formula:[["Jojoba Oil",95],["Geranium",1.5],["Ylang-ylang",1],["Lavender",1],["Sandalwood material",1],["Vanilla aromatic material",0.5]], positioning:"Oil perfume designed to fragrance the skin.", launchStatus:prelaunch, fragranceGate:true },

  // Citrus Bloom deliberately remains outside the sellable V1 definitions until exact materials
  // and a non-phototoxic/FCF-safe percentage are frozen from supplier documentation.

  // The Master Guide deliberately does not invent a universal soap percentage. The exact
  // cosmetic-grade melt-and-pour base and compatible additive levels must come from supplier docs.
  { id:"us_soap_exfoliating", name:"Exfoliating Glycerin Soap", size:"100 g", family:"Glycerin Soap", formulaCode:"VC-SOAP-EX-001", version:"supplier-dependent", formula:null, positioning:"Cleansing glycerin/melt-and-pour soap with an appropriately fine coffee or oatmeal variant.", launchStatus:prelaunch, supplierFormulaGate:true },
  { id:"us_soap_herbal", name:"Natural Herbal Glycerin Soap", size:"100 g", family:"Glycerin Soap", formulaCode:"VC-SOAP-HB-001", version:"supplier-dependent", formula:null, positioning:"Cleansing glycerin/melt-and-pour soap with a compatible chamomile/calendula concept.", launchStatus:prelaunch, supplierFormulaGate:true },
  { id:"us_soap_flower", name:"Flower-Shaped Glycerin Soap", size:"100 g", family:"Glycerin Soap", formulaCode:"VC-SOAP-FL-001", version:"supplier-dependent", formula:null, positioning:"The documented glycerin/melt-and-pour base in floral molds with an assessed scent variant.", launchStatus:prelaunch, supplierFormulaGate:true },
  { id:"us_soap_fruit", name:"Fruit-Shaped Glycerin Soap", size:"100 g", family:"Glycerin Soap", formulaCode:"VC-SOAP-FR-001", version:"supplier-dependent", formula:null, positioning:"The documented glycerin/melt-and-pour base in fruit molds with an assessed scent variant.", launchStatus:prelaunch, supplierFormulaGate:true }
];

export const US_V1_FAMILIES = ["Body Butter","Face Balm","Hand & Foot Balm","Solid Perfume","Perfume Oil Roll-On","Glycerin Soap"];

export function assertFormulaTotals() {
  for (const product of US_V1_PRODUCTS) {
    if (!product.formula) continue;
    const total = product.formula.reduce((sum,[,percentage]) => sum + percentage,0);
    if (Math.abs(total-100)>0.0001) throw new Error(`Formula ${product.formulaCode} totals ${total}%`);
  }
  return true;
}
