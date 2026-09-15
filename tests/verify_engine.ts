/**
 * Automated Verification Suite for Finance Life Simulator Core Engines
 */

import { DebtEngine } from '../src/core/debt/DebtEngine';
import { InvestmentEngine } from '../src/core/investment/InvestmentEngine';
import { HealthEngine } from '../src/core/health/HealthEngine';
import { AccountingEngine } from '../src/core/accounting/AccountingEngine';
import { WhatIfEngine } from '../src/core/whatif/WhatIfEngine';
import { BalanceSheet, MonthlyBudget } from '../src/core/types/finance';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log('\n--- 1. Testing Debt Engine Math ---');
// ₹1,00,000 loan at 12% p.a. for 12 months
// Standard financial formula: EMI = 8884.88 ~ 8885
const emi = DebtEngine.calculateMonthlyEMI(100000, 0.12, 12);
assert(emi >= 8880 && emi <= 8890, `EMI calculation: expected ~8885, got ${emi}`);

const totalInterest = DebtEngine.calculateTotalInterest(100000, 0.12, 12);
assert(totalInterest >= 6500 && totalInterest <= 6700, `Total Interest: expected ~6619, got ${totalInterest}`);

const liab = DebtEngine.createLiability('personal_loan', 'Test Loan', 100000, 0.12, 12);
const paymentCycle = DebtEngine.processMonthlyRepayments([liab]);
assert(paymentCycle.updatedLiabilities[0].remainingBalance < 100000, 'Loan balance decrements after payment');
assert(paymentCycle.totalPaid === emi, 'Total paid matches calculated EMI');


console.log('\n--- 2. Testing Investment & Diversification Engine ---');
const singleAsset = [InvestmentEngine.createDefaultAsset('stocks', 'Speculative Stock', 50000)];
const singleDiversification = InvestmentEngine.calculateDiversificationScore(singleAsset);
assert(singleDiversification.hhi === 1.0, 'Single asset yields maximum concentration HHI = 1.0');
assert(singleDiversification.score <= 4, `Concentrated score penalization: got ${singleDiversification.score}/15`);

const diversifiedAssets = [
  InvestmentEngine.createDefaultAsset('fixed_deposit', 'Safe Bank FD', 25000),
  InvestmentEngine.createDefaultAsset('bonds', 'Government Bond', 25000),
  InvestmentEngine.createDefaultAsset('mutual_fund_equity', 'Nifty 50 Index', 30000),
  InvestmentEngine.createDefaultAsset('gold', 'Digital Gold', 20000),
];
const multiDiversification = InvestmentEngine.calculateDiversificationScore(diversifiedAssets);
assert(multiDiversification.hhi < 0.35, `Diversified portfolio yields low HHI: got ${multiDiversification.hhi.toFixed(2)}`);
assert(multiDiversification.score >= 12, `Diversified portfolio receives high score: got ${multiDiversification.score}/15`);


console.log('\n--- 3. Testing Accounting Balance Sheet Invariants ---');
const testBS: BalanceSheet = {
  liquidCash: 20000,
  emergencyFund: 30000,
  investmentsTotal: 50000,
  assets: diversifiedAssets,
  liabilitiesTotal: 25000,
  liabilities: [DebtEngine.createLiability('personal_loan', 'Gadget Loan', 25000, 0.14, 12)],
  netWorth: 75000, // 20k + 30k + 50k - 25k = 75k
};

const testBudget: MonthlyBudget = {
  baseSalary: 50000,
  bonusOrExtraIncome: 0,
  fixedNeeds: { rent: 15000, utilities: 3000, groceries: 6000, healthInsurance: 1000 },
  discretionaryWants: { entertainment: 2000, diningOut: 3000, shopping: 2000 },
};

const tickResult = AccountingEngine.processMonthlyTick(testBS, testBudget, 'bull', 1, 2026);
assert(tickResult.updatedBalanceSheet.liquidCash > 0, 'Liquid cash remains solvent after income & expenses');
assert(
  tickResult.updatedBalanceSheet.netWorth ===
    tickResult.updatedBalanceSheet.liquidCash +
      tickResult.updatedBalanceSheet.emergencyFund +
      tickResult.updatedBalanceSheet.investmentsTotal -
      tickResult.updatedBalanceSheet.liabilitiesTotal,
  'Net Worth invariant holds strictly: Assets - Liabilities'
);


console.log('\n--- 4. Testing Financial Health Scorer ---');
const health = HealthEngine.calculateHealthScore(testBS, tickResult.cashFlowReport, 3);
assert(health.totalScore >= 0 && health.totalScore <= 100, `Health score bounded 0-100: got ${health.totalScore}`);
assert(typeof health.grade === 'string', `Grade calculated: ${health.grade}`);
assert(health.keyStrength.length > 0, `Key strength identified: ${health.keyStrength}`);


console.log('\n--- 5. Testing What-If Sandbox Projections ---');
const whatIfResult = WhatIfEngine.simulateScenario(testBS, testBudget, 22, {
  title: 'Extra ₹5,000 SIP monthly',
  monthlyAdditionalSavings: 0,
  monthlyAdditionalSIP: 5000,
  delayInvestingByYears: 0,
  projectionMonths: 36,
  assumedAnnualEquityReturn: 0.12,
  assumedAnnualInflation: 0.06,
});

assert(whatIfResult.chartPoints.length === 36, 'Simulated exactly 36 monthly points forward');
assert(
  whatIfResult.whatIfFinalNetWorth > whatIfResult.baselineFinalNetWorth,
  'Additional SIP yields significantly higher final net worth'
);
assert(
  testBS.investmentsTotal === 50000,
  'Base state was not mutated by sandbox simulation'
);

console.log('\n🎉 ALL CORE FINANCIAL ENGINE TESTS PASSED PERFECTLY!\n');
