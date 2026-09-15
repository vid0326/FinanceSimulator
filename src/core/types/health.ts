/**
 * Financial Health, Score Breakdown and Gamification Types
 */

export interface HealthScoreBreakdown {
  savingsRateScore: number;       // Max 20: 20%+ savings/investments rate
  debtManagementScore: number;    // Max 20: Debt to income / EMI burden
  emergencyFundScore: number;     // Max 15: 3-6 months liquid buffer
  diversificationScore: number;   // Max 15: Asset concentration distribution
  investmentDisciplineScore: number; // Max 20: SIP regularity & compounding habit
  cashFlowStabilityScore: number; // Max 10: Positive cash flow & no overdrafts
  totalScore: number;             // Max 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  keyStrength: string;
  keyVulnerability: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'saving' | 'investing' | 'debt' | 'emergency' | 'resilience';
  unlockedAtMonth?: number;
}

export interface GamificationState {
  xp: number;
  level: number;
  levelTitle: string;
  achievements: AchievementBadge[];
  decisionsMadeCount: number;
  streakMonths: number;
}
