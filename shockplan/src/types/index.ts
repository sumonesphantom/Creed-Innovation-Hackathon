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
export type EventStatus = "not_started" | "in_progress" | "done" | "abandoned" | "paused";
export type LifePathZoom = "month" | "year" | "fiveYear";
export type LifePathEventCategory =
  | "income"
  | "housing"
  | "family"
  | "health"
  | "debt"
  | "transport"
  | "education"
  | "benefits"
  | "savings"
  | "other";
export type LifePathMilestonePhase = "now" | "next30" | "oneToThreeMonths" | "later";

export type LifePathNodeType = "root" | "decision" | "outcome";

export interface LifePathMilestoneTemplate {
  phase: LifePathMilestonePhase;
  title: string;
  detail?: string;
}

export interface LifePathNodeDef {
  id: string;
  type: LifePathNodeType;
  label: string;
  monthlyIncomeDelta: number;
  monthlyExpenseDelta: number;
  monthsToStability: number;
  summary?: string;
  milestoneTemplates?: LifePathMilestoneTemplate[];
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

export interface LifePathCustomEvent {
  id: string;
  label: string;
  category: LifePathEventCategory;
  monthlyIncomeDelta: number;
  monthlyExpenseDelta: number;
  oneTimeCashDelta: number;
  startMonthOffset: number;
  durationMonths: number;
  monthsToStability?: number;
  risk: PathRiskLevel;
  status: EventStatus;
  targetDate: string;
  notes: string;
  attachedNodeId?: string;
}

export type LifePathExtraEvent = LifePathCustomEvent;

export interface LifePathManualMilestone {
  id: string;
  title: string;
  detail: string;
  phase: LifePathMilestonePhase;
  done: boolean;
}

export interface LifePathNodeOverride {
  monthlyIncomeDelta: number;
  monthlyExpenseDelta: number;
}

export interface LifePathScenario {
  id: string;
  deviceId?: string;
  userId?: string;
  name: string;
  templateId: string;
  selections: Record<string, number>;
  nodeOverrides: Record<string, LifePathNodeOverride>;
  customEvents: LifePathCustomEvent[];
  manualMilestones: LifePathManualMilestone[];
  generatedMilestoneCompletion: Record<string, boolean>;
  notes: string;
  zoom: LifePathZoom;
  createdAt: string;
  updatedAt: string;
}

export interface LifePathProjectionMonth {
  month: number;
  label: string;
  incomeDelta: number;
  expenseDelta: number;
  oneTimeCashDelta: number;
  netChange: number;
  cumulativeSwing: number;
  activeEvents: string[];
}

export interface LifePathProjectionSummary {
  currentMonthlyIncomeDelta: number;
  currentMonthlyExpenseDelta: number;
  currentNetMonthly: number;
  averageNetMonthly: number;
  projectedSwing: number;
  stabilityMonths: number;
  highestCumulativeSwing: number;
  lowestCumulativeSwing: number;
}

export interface GeneratedLifePathMilestone {
  sourceKey: string;
  title: string;
  detail: string;
  phase: LifePathMilestonePhase;
}

export interface ChatMessage {
  role: "user" | "buddy";
  content: string;
  timestamp: Date;
}
