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

export interface ChatMessage {
  role: "user" | "buddy";
  content: string;
  timestamp: Date;
}
