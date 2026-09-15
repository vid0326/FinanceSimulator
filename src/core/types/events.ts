/**
 * Life Events, Scenarios, Decisions and Consequence Types
 */

import { LifeStage } from './profile';
import { AssetType } from './finance';

export type LifeEventCategory = 
  | 'career' 
  | 'emergency' 
  | 'lifestyle' 
  | 'market' 
  | 'tax' 
  | 'scam' 
  | 'credit'
  | 'investment';

export interface ConsequenceImpact {
  cashDelta: number;
  savingsDelta: number;
  debtDelta: number;
  newDebtItem?: {
    name: string;
    type: 'credit_card' | 'personal_loan' | 'education_loan' | 'vehicle_loan';
    principal: number;
    annualInterestRate: number;
    tenureMonths: number;
  };
  investmentDelta?: {
    type: AssetType;
    name: string;
    amount: number;
    expectedReturnRate: number;
  };
  monthlyIncomeDelta?: number;
  monthlyExpenseDelta?: number;
  financialHealthDelta: number;
  lifeSatisfactionDelta: number;
  whatHappened: string;
  whyItHappened: string;
  financialLesson: string;
  futureImpactSummary: string;
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  consequence: ConsequenceImpact;
  requiredCash?: number;
  requiredSavings?: number;
  badgeUnlockId?: string;
}

export interface LifeScenarioEvent {
  id: string;
  title: string;
  category: LifeEventCategory;
  triggerAgeRange?: [number, number];
  applicableStages: LifeStage[];
  headline: string;
  storyDescription: string;
  options: DecisionOption[];
  icon: string;
  accentColor: string;
  oneTimeOnly?: boolean;
}

export interface EventDecisionLog {
  id: string;
  eventId: string;
  eventTitle: string;
  eventCategory: LifeEventCategory;
  selectedOptionId: string;
  selectedOptionTitle: string;
  monthSimulated: number;
  age: number;
  consequence: ConsequenceImpact;
  timestamp: number;
}
