/**
 * What-If Sandbox Projections and Scenario Comparison Types
 */

export interface WhatIfScenarioInput {
  title: string;
  monthlyAdditionalSavings: number; // e.g. +₹5,000/month
  monthlyAdditionalSIP: number;     // e.g. +₹3,000/month
  delayInvestingByYears: number;    // e.g. start at 27 vs 22
  takeNewLoan?: {
    principal: number;
    annualInterestRate: number;
    tenureMonths: number;
    purpose: string;
  };
  jobLossPeriodMonths?: number;
  projectionMonths: number;         // 12 to 120 (1 to 10 years)
  assumedAnnualEquityReturn: number; // default 0.12 (12%)
  assumedAnnualInflation: number;    // default 0.06 (6%)
}

export interface ProjectionDataPoint {
  monthIndex: number;
  age: number;
  baselineNetWorth: number;
  whatIfNetWorth: number;
  baselineInvestments: number;
  whatIfInvestments: number;
  baselineDebt: number;
  whatIfDebt: number;
  baselinePurchasingPower: number;
  whatIfPurchasingPower: number;
}

export interface WhatIfComparisonResult {
  input: WhatIfScenarioInput;
  baselineFinalNetWorth: number;
  whatIfFinalNetWorth: number;
  netWorthDifference: number;
  percentageImpact: number;
  baselineTotalInterestPaid: number;
  whatIfTotalInterestPaid: number;
  baselineTotalWealthAccumulated: number;
  whatIfTotalWealthAccumulated: number;
  chartPoints: ProjectionDataPoint[];
  aiCoachInsight: string;
  keyEducationalTakeaway: string;
}
