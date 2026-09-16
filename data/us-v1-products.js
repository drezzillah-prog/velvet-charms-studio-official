// Velvet Charms Studio USA V1 — controlled product definitions.
// Source: Velvet_Charms_USA_EU_Launch_Master_Guide.docx (16 Sep 2026).
// These definitions do not modify the original Body Glow catalogue.

export const US_V1_PRODUCTS = [
  {
    id: "us_body_butter_100",
    name: "Body Butter",
    size: "100 g",
    family: "Body Butter",
    formulaCode: "VC-BB-001",
    version: "1.0",
    formula: [
      ["Shea Butter, cosmetic grade", 55],
      ["Sweet Almond Oil", 24],
      ["Jojoba Oil", 15],
      ["Beeswax", 5],
      ["Tocopherol / Vitamin E", 1]
    ],
    positioning: "Rich, water-free body butter designed to moisturize, soften and condition the skin.",
    launchStatus: "prelaunch"
  },
  {
    id: "us_face_balm_100",
    name: "Nourishing Face Balm",
    size: "100 g prototype",
    family: "Face Balm",
    formulaCode: "VC-FB-001",
    version: "1.0",
    formula: [
      ["Jojoba Oil", 45],
      ["Squalane, documented cosmetic grade", 25],
      ["Shea Butter", 20],
      ["Beeswax", 9],
      ["Tocopherol", 1]
    ],
    positioning: "Simple unscented face balm with cosmetic moisturization and conditioning positioning.",
    launchStatus: "prelaunch"
  },
  {
    id: "us_hand_foot_balm_100",
    name: "Hand & Foot Balm",
    size: "100 g prototype",
    family: "Hand & Foot Balm",
    formulaCode: "VC-HFB-001",
    version: "1.0",
    formula: [
      ["Shea Butter", 45],
      ["Sweet Almond Oil", 25],
      ["Jojoba Oil", 15],
      ["Beeswax", 14],
      ["Tocopherol", 1]
    ],
    positioning: "Rich, water-free balm designed to moisturize, soften and condition hands and feet.",
    launchStatus: "prelaunch"
  }
];

export const US_V1_FAMILIES = [
  "Body Butter",
  "Face Balm",
  "Hand & Foot Balm",
  "Solid Perfume",
  "Perfume Oil Roll-On",
  "Glycerin Soap"
];

export function assertFormulaTotals() {
  for (const product of US_V1_PRODUCTS) {
    const total = product.formula.reduce((sum, [, percentage]) => sum + percentage, 0);
    if (Math.abs(total - 100) > 0.0001) throw new Error(`Formula ${product.formulaCode} totals ${total}%`);
  }
  return true;
}
