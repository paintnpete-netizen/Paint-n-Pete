window.JOB = {
  template: "commercial",
  number: "PNP-YYYY-MMDD",
  date: "[DATE]",
  work: "Commercial interior",
  client: "[GC / Property manager]",
  phone: "",
  email: "",
  site: "[Project address]",
  headline: "Painting proposal — [project name]",
  lede: "[2–3 sentences: building type, occupancy, schedule constraint, and why Paint'n Pete is a fit. No superlatives.]",
  summary: "[One paragraph: total areas, coat standard, product line, and bid intent.]",
  parties: [
    { label: "Submitted to", value: "[GC / Property manager name]" },
    { label: "Project", value: "[Project / building name]" },
    { label: "Owner / tenant", value: "[Entity name or TBD]" },
    { label: "Proposal date", value: "[DATE]" },
    { label: "Bid due", value: "[Bid due date or N/A]" },
    { label: "Job site", value: "[Project address]" },
    { label: "Contact", value: "[Name · phone · email]" }
  ],
  prices: [
    { amount: "[PRICE]", label: "Base contract — specified scope", total: true }
  ],
  customAddons: [
    { label: "[Alternate or optional line — delete if none]", amount: "[PRICE]" }
  ],
  deposit: "Progress payments per contract terms below",
  validity: "Valid 30 days from proposal date",
  retainage: "Retainage: [10]% held until punch-list completion unless otherwise specified in owner contract.",
  scope: [
    {
      title: "[Area 1 — e.g. Floor 2 corridors]",
      body: "[Surfaces, prep level, coat count, colors.]",
      included: ["Wash / scuff-sand / spot-prime as needed", "Two finish coats", "Floor and fixture protection", "Daily cleanup"]
    }
  ],
  surfaces: [
    { area: "[Area 1]", walls: "[sq ft]", ceiling: "[sq ft]", doors: "[count]", notes: "[Color / phase]" }
  ],
  surfaceTotals: { walls: "[total]", ceiling: "[total]", doors: "[total]" },
  products: [
    { surface: "Walls", product: "[Product line]", sheen: "[Sheen]", why: "[VOC / durability note]" },
    { surface: "Ceilings", product: "[Product line]", sheen: "Flat", why: "[Note]" },
    { surface: "Trim / doors", product: "[Product line]", sheen: "Semi-gloss", why: "[Note]" }
  ],
  schedule: {
    hours: "[Business hours / after-hours / weekends]",
    phasing: "[Single mobilization / phased by floor or tenant]",
    duration: "[Estimated calendar duration]",
    access: "[Staging, lifts, escorts, protection of occupied areas]"
  },
  qualifications: [
    "Kanwal Consulting LLC DBA Paint'n Pete — licensed Florida business",
    "General liability and workers' compensation certificates available (COI on request)",
    "Occupied-space and after-hours repainting experience",
    "Written prep and protection standards for every crew",
    "Two-year workmanship warranty on specified coatings"
  ],
  included: [
    "Labor, materials, and standard consumables for specified surfaces",
    "Surface prep per scope — wash, sand, caulk, spot-prime as listed",
    "Protection of floors, fixtures, and adjacent finishes in work areas",
    "Daily cleanup; broom-clean turnover at end of each shift",
    "Final walkthrough with owner's representative",
    "Two-year workmanship warranty"
  ],
  excluded: [
    "Wallpaper or covering removal",
    "Lead, asbestos, or mold testing / abatement",
    "Structural repairs or substrate replacement beyond incidental patching",
    "Moving tenant furniture, IT, or specialty equipment",
    "Fireproofing or specialty industrial coatings",
    "Owner-furnished paint (can apply; no finish warranty on client-supplied product)",
    "Permits and fees unless explicitly listed",
    "Mock-ups beyond one standard color sample per area"
  ],
  assumptions: [
    "Surfaces are sound, dry, and free of active moisture unless noted in the walkthrough.",
    "Access, power, water, and a staging area are provided by owner or GC.",
    "Colors and sheens confirmed in writing before production coats begin.",
    "Unforeseen substrate damage discovered after start is a written change order.",
    "Prevailing wage / certified payroll not included unless stated in writing."
  ],
  sequence: [
    "Pre-construction meeting — confirm contacts, phasing, and submittals",
    "Mobilize — protection, signage, and work-zone isolation",
    "Prep — wash, scrape, sand, caulk, prime per specification",
    "Finish coats — sequenced to minimize disruption",
    "Punch list and turnover — substantial completion walkthrough"
  ],
  terms: [
    "Payment: [Net 30 / progress draws / 50% mobilize · 50% substantial completion].",
    "Change orders in writing before extra work; unit rates available for add/deduct.",
    "Proposal valid 30 days. Insurance certificates furnished upon award.",
    "Retainage per owner contract or as stated above.",
    "Substantial completion defined as specified surfaces coated per scope, punch list issued."
  ],
  accept: "Sign below and return with a purchase order or signed contract, or reply by email to authorize mobilization. We will confirm start date and issue COI naming required additional insureds.",
  fine: "This proposal is an offer to perform work as described. Owner/GC contract documents govern if they conflict with this summary. Weather, cure time, and upstream trade delays may adjust the schedule. Proposal valid 30 days."
};
