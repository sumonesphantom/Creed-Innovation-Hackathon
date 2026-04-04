export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image: string;
  provider: string;
  deviceId?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserProfile {
  deviceId: string;
  userId?: string;
  household: "single" | "couple" | "family" | "multi-gen" | "";
  housing: "rent" | "own" | "family" | "other" | "";
  incomeType: "salary" | "gig" | "hourly" | "unemployed" | "retired" | "";
  incomeRange: "0-1k" | "1k-3k" | "3k-5k" | "5k+" | "";
  state: string;
  insurance: string[];
  dependents: number;
  canCover500: "yes" | "maybe" | "no" | "";
  language: "en" | "es";
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadinessScore {
  deviceId: string;
  userId?: string;
  score: number;
  breakdown: {
    savings: number;
    insurance: number;
    documents: number;
    awareness: number;
  };
  calculatedAt: Date;
}

export interface BuddyChatMessage {
  id: string;
  role: "user" | "buddy";
  content: string;
  createdAt: Date;
}

export interface CommunityPost {
  _id?: string;
  crisisType: string;
  state: string;
  content: string;
  upvotes: number;
  createdAt: Date;
}

export interface VaultItem {
  _id?: string;
  deviceId: string;
  fileName: string;
  fileType: string;
  category: "insurance" | "id" | "receipt" | "photo" | "other";
  uploadedAt: Date;
}

export interface CrisisEvent {
  id: string;
  name: string;
  icon: string;
  description: string;
  immediateActions: {
    tenMinutes: string[];
    twentyFourHours: string[];
    sevenDays: string[];
  };
  insuranceRelevant: boolean;
  insuranceType: string[];
  commonCosts: string;
  benefitsToCheck: string[];
}

export interface BudgetItem {
  category: string;
  amount: number;
  priority: "essential" | "important" | "deferrable" | "cuttable";
}

export type BudgetMode = "normal" | "crisis";

export interface BudgetBillLine {
  id: string;
  label: string;
  amount: number;
}

export type BudgetBucketName = "payFirst" | "defer" | "cut";

export interface BudgetBucketGroup {
  bucket: BudgetBucketName;
  billIds: string[];
}

export interface BudgetWeekProjection {
  week: number;
  balanceEnd: number;
}

export interface BudgetNormalBreakdown {
  housing: number;
  food: number;
  transport: number;
  medical: number;
  other: number;
}

export interface BudgetCalculationInput {
  mode: BudgetMode;
  deviceId?: string;
  monthlyIncome: number;
  normalExpenses?: BudgetNormalBreakdown;
  cashOnHand?: number;
  bills?: BudgetBillLine[];
  billOrder?: string[];
  skippedBillIds?: string[];
  extraIncomeWeekly?: number;
  timelineWeeks?: number;
}

export interface BudgetCalculationResult {
  mode: BudgetMode;
  monthlyIncome: number;
  totalExpenses: number;
  remaining: number;
  categoryPercents: { key: keyof BudgetNormalBreakdown; label: string; percent: number; amount: number }[];
  crisis?: {
    cashOnHand: number;
    buckets: BudgetBucketGroup[];
    payFirstMonthly: number;
    weeklyEssentialBurn: number;
    runwayDays: number | null;
    runwayWeeks: number | null;
    weeklyNetOutflow: number;
    weeks: BudgetWeekProjection[];
  };
}

export type PathRiskLevel = "stable" | "risky" | "crisis";

export type LifePathNodeType = "root" | "decision" | "outcome";

export interface LifePathNodeDef {
  id: string;
  type: LifePathNodeType;
  label: string;
  monthlyIncomeDelta: number;
  monthlyExpenseDelta: number;
  monthsToStability: number;
}

export interface LifePathEdgeDef {
  id: string;
  from: string;
  to: string;
  risk: PathRiskLevel;
}

export interface LifePathTemplate {
  id: string;
  title: string;
  description: string;
  nodes: LifePathNodeDef[];
  edges: LifePathEdgeDef[];
}

export interface LifePathExtraEvent {
  id: string;
  label: string;
  monthlyIncomeDelta: number;
  monthlyExpenseDelta: number;
  monthsToStability: number;
  risk: PathRiskLevel;
}

export interface ChatMessage {
  role: "user" | "buddy";
  content: string;
  timestamp: Date;
}
