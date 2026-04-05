import { Document } from "@langchain/core/documents";

export const BUDDY_KNOWLEDGE_DOCUMENTS: Document[] = [
  new Document({
    pageContent:
      "Emergency fund basics: An emergency fund is cash set aside for unexpected expenses or income loss. A common starting goal is one month of essential expenses, then building toward three to six months. Keep it in a safe, easy-to-access place such as a savings account, not invested in volatile assets. Small automatic transfers each payday add up.",
    metadata: { topic: "emergency-fund", source: "shockplan-kb" },
  }),
  new Document({
    pageContent:
      "Insurance deductible: A deductible is the amount you pay out of pocket before your insurance pays covered costs. Higher deductibles often mean lower monthly premiums but more cost when you file a claim. Copay is a fixed amount per visit or prescription; coinsurance is a percentage you pay after the deductible.",
    metadata: { topic: "insurance-terms", source: "shockplan-kb" },
  }),
  new Document({
    pageContent:
      "Job loss first steps: File for unemployment benefits in your state as soon as you are eligible; deadlines matter. List minimum monthly costs (housing, utilities, food, medicine) and pause non-essential spending. Contact lenders or servicers early if you may miss payments—many have hardship programs. Update your resume and reach out to your network in short, specific asks.",
    metadata: { topic: "job-loss", source: "shockplan-kb" },
  }),
  new Document({
    pageContent:
      "Medical bills: Ask for an itemized bill and check for duplicate or unclear charges. Nonprofit hospitals often have financial assistance policies. You can ask about payment plans, prompt-pay discounts, or charity care. If insured, confirm the claim was processed correctly and whether the provider is in-network.",
    metadata: { topic: "medical-bills", source: "shockplan-kb" },
  }),
  new Document({
    pageContent:
      "Car accident checklist: Check safety first; call emergency services if anyone is hurt. Exchange insurance and contact information; photograph damage and scene if it is safe. File a police report when required by law or insurer. Notify your insurer promptly and keep records of claim numbers and conversations.",
    metadata: { topic: "car-accident", source: "shockplan-kb" },
  }),
  new Document({
    pageContent:
      "Storm or natural disaster damage: Document damage with photos and lists before cleanup when possible. Contact your insurer to start a claim and ask what temporary repairs are allowed. Save receipts for tarps, supplies, or lodging if coverage may apply. Local emergency management may post shelters or aid programs.",
    metadata: { topic: "storm-damage", source: "shockplan-kb" },
  }),
  new Document({
    pageContent:
      "Rent increase stress: Compare your lease terms and local notice rules. If the increase is unaffordable, explore roommate options, income-based programs, or moving to a lower-cost unit. Nonprofit housing counselors can explain tenant rights in your area. Prioritize written communication with your landlord.",
    metadata: { topic: "rent-spike", source: "shockplan-kb" },
  }),
  new Document({
    pageContent:
      "Major home repair: Get multiple quotes when possible. Separate urgent fixes (safety, water damage) from cosmetic work. Check whether homeowners or warranty coverage applies before paying out of pocket. Payment plans or low-interest programs sometimes exist through utilities or local nonprofits.",
    metadata: { topic: "home-repair", source: "shockplan-kb" },
  }),
  new Document({
    pageContent:
      "Death in the family—practical steps: Obtain certified copies of the death certificate for banks, insurers, and employers. Locate wills, trusts, and account beneficiary designations—they often control who receives assets. Notify Social Security and employers; ask about survivor benefits. Consider a short delay on big financial decisions when emotions are high.",
    metadata: { topic: "death-family", source: "shockplan-kb" },
  }),
  new Document({
    pageContent:
      "Budgeting after a shock: Start with four categories: must-pay (housing, utilities, minimum debt, food, medicine), can-wait, can-cut, and unknowns. Use cash or one dedicated account for weekly spending to avoid overspending. Revisit the budget weekly until income stabilizes.",
    metadata: { topic: "budgeting-crisis", source: "shockplan-kb" },
  }),
  new Document({
    pageContent:
      "Credit and debt during hardship: Prioritize housing, utilities, and food. Contact creditors before you miss payments; document names and confirmation numbers. Be cautious of high-fee debt relief scams; nonprofit credit counseling agencies can review options. Understand how deferment or forbearance affects interest.",
    metadata: { topic: "credit-debt", source: "shockplan-kb" },
  }),
  new Document({
    pageContent:
      "Emotional support and scams: Stress makes people more vulnerable to fraud. Government agencies and real charities rarely demand gift cards or wire transfers. If someone pressures you for personal information or immediate payment, pause and verify through official channels. It is okay to lean on trusted friends or counselors.",
    metadata: { topic: "scams-wellbeing", source: "shockplan-kb" },
  }),
  new Document({
    pageContent:
      "Income types and volatility: Hourly and gig income can swing week to week; salaried income is steadier but not immune to layoffs. When income is uneven, base your minimum budget on a conservative month, not your best month. Tax withholding and quarterly taxes may differ for self-employment—generic education only; a tax professional can help with specifics.",
    metadata: { topic: "income-types", source: "shockplan-kb" },
  }),
  new Document({
    pageContent:
      "Insurance types overview: Health insurance helps with medical costs; auto with vehicle-related liability and damage; renters or homeowners with theft or dwelling damage where applicable; life insurance may support dependents after a death. Each policy has limits, exclusions, and deductibles—read the summary of benefits or declarations page.",
    metadata: { topic: "insurance-overview", source: "shockplan-kb" },
  }),
];
