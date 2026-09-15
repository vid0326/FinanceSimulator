/**
 * User Profile and Lifecycle Stage Definitions
 */

export type LifeStage = 'student' | 'intern' | 'first_job' | 'experienced' | 'independent';

export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

export interface StartingStagePreset {
  id: LifeStage;
  title: string;
  age: number;
  career: string;
  monthlyIncome: number;
  startingCash: number;
  startingSavings: number;
  startingDebt: number;
  fixedMonthlyExpenses: number;
  description: string;
}

export const STAGE_PRESETS: Record<LifeStage, StartingStagePreset> = {
  student: {
    id: 'student',
    title: 'College Student',
    age: 20,
    career: 'Undergraduate',
    monthlyIncome: 6000,
    startingCash: 2500,
    startingSavings: 5000,
    startingDebt: 0,
    fixedMonthlyExpenses: 3500,
    description: 'Pocket money and part-time gig. Learn budgeting, saving, and avoiding bad debt early.',
  },
  intern: {
    id: 'intern',
    title: 'Tech/Corporate Intern',
    age: 22,
    career: 'Graduate Intern',
    monthlyIncome: 22000,
    startingCash: 5000,
    startingSavings: 15000,
    startingDebt: 0,
    fixedMonthlyExpenses: 12000,
    description: 'First real stipend. Learn to manage lifestyle inflation and start your first SIP.',
  },
  first_job: {
    id: 'first_job',
    title: 'Junior Associate / SDE',
    age: 23,
    career: 'Junior Software Engineer',
    monthlyIncome: 45000,
    startingCash: 12000,
    startingSavings: 40000,
    startingDebt: 0,
    fixedMonthlyExpenses: 24000,
    description: 'Full-time salary with rent, credit card offers, EMIs, and tax deductions.',
  },
  experienced: {
    id: 'experienced',
    title: 'Senior Professional',
    age: 28,
    career: 'Senior Engineer / Consultant',
    monthlyIncome: 110000,
    startingCash: 35000,
    startingSavings: 200000,
    startingDebt: 150000,
    fixedMonthlyExpenses: 55000,
    description: 'Higher income with serious financial goals, tax planning, and portfolio asset allocation.',
  },
  independent: {
    id: 'independent',
    title: 'Financial Independence Path',
    age: 35,
    career: 'Tech Lead / Entrepreneur',
    monthlyIncome: 200000,
    startingCash: 80000,
    startingSavings: 600000,
    startingDebt: 0,
    fixedMonthlyExpenses: 85000,
    description: 'Wealth preservation, compounding, large family goals, and inflation hedging.',
  },
};

export interface UserProfile {
  name: string;
  avatarSeed: string;
  currentAge: number;
  currentMonth: number; // 1 to 12 in the year
  totalMonthsSimulated: number;
  currentStage: LifeStage;
  career: string;
  riskTolerance: RiskTolerance;
  financialGoal: {
    title: string;
    targetAmount: number;
    targetYears: number;
  };
}
