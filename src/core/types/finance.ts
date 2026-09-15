/**
 * Financial Domain Models & Accounting Data Structures
 */

export type AssetType = 
  | 'cash' 
  | 'savings_account' 
  | 'fixed_deposit' 
  | 'bonds' 
  | 'mutual_fund_equity' 
  | 'mutual_fund_debt' 
  | 'stocks' 
  | 'gold';

export type LiabilityType = 
  | 'credit_card' 
  | 'personal_loan' 
  | 'education_loan' 
  | 'vehicle_loan';

export type MarketCondition = 
  | 'bull' 
  | 'bear' 
  | 'crash' 
  | 'recovery' 
  | 'stagnant';

export interface AssetItem {
  id: string;
  type: AssetType;
  name: string;
  category: 'cash_equivalent' | 'debt_instrument' | 'equity' | 'commodity';
  investedAmount: number;
  currentValue: number;
  expectedAnnualReturnRate: number; // e.g., 0.07 for 7%
  volatility: number; // standard deviation e.g., 0.15 for 15%
  liquidityTier: 'immediate' | 'short_notice' | 'locked'; // locked has penalty
  monthlySIPAmount?: number;
}

export interface LiabilityItem {
  id: string;
  type: LiabilityType;
  name: string;
  principalAmount: number;
  remainingBalance: number;
  annualInterestRate: number; // e.g., 0.14 for 14%
  monthlyEMI: number;
  remainingTenureMonths: number;
  totalTenureMonths: number;
  isCreditCard?: boolean;
  creditLimit?: number;
  minimumDue?: number;
}

export interface MonthlyBudget {
  baseSalary: number;
  bonusOrExtraIncome: number;
  fixedNeeds: {
    rent: number;
    utilities: number;
    groceries: number;
    healthInsurance: number;
  };
  discretionaryWants: {
    entertainment: number;
    diningOut: number;
    shopping: number;
  };
}

export interface BalanceSheet {
  liquidCash: number;
  emergencyFund: number;
  investmentsTotal: number;
  assets: AssetItem[];
  liabilitiesTotal: number;
  liabilities: LiabilityItem[];
  netWorth: number;
}

export interface MonthlyCashFlowReport {
  month: number;
  year: number;
  totalIncome: number;
  totalFixedExpenses: number;
  totalDiscretionaryExpenses: number;
  totalEMIs: number;
  totalSIPContributions: number;
  emergencyContribution: number;
  netSavingsOrDeficit: number;
  beginningCash: number;
  endingCash: number;
  penaltyCharges: number;
}

export interface HistoricalSnapshot {
  monthIndex: number;
  age: number;
  monthInYear: number;
  netWorth: number;
  liquidCash: number;
  investmentsTotal: number;
  liabilitiesTotal: number;
  financialHealthScore: number;
  lifeSatisfactionScore: number;
  marketCondition: MarketCondition;
}
