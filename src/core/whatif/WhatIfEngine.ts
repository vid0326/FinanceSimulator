/**
 * What-If Sandbox Projections Engine
 * Deep-clones state and simulates multi-year comparative trajectories without mutating live data.
 */

import { BalanceSheet, MonthlyBudget, MarketCondition } from '../types/finance';
import { WhatIfScenarioInput, WhatIfComparisonResult, ProjectionDataPoint } from '../types/whatif';
import { AccountingEngine } from '../accounting/AccountingEngine';
import { DebtEngine } from '../debt/DebtEngine';
import { InvestmentEngine } from '../investment/InvestmentEngine';

export class WhatIfEngine {
  public static simulateScenario(
    currentBalanceSheet: BalanceSheet,
    currentBudget: MonthlyBudget,
    currentAge: number,
    scenarioInput: WhatIfScenarioInput
  ): WhatIfComparisonResult {
    const projectionMonths = scenarioInput.projectionMonths || 60; // 5 years default
    const chartPoints: ProjectionDataPoint[] = [];

    // Clone state for Baseline
    let baseBS: BalanceSheet = JSON.parse(JSON.stringify(currentBalanceSheet));
    let baseBudget: MonthlyBudget = JSON.parse(JSON.stringify(currentBudget));

    // Clone state for What-If
    let whatIfBS: BalanceSheet = JSON.parse(JSON.stringify(currentBalanceSheet));
    let whatIfBudget: MonthlyBudget = JSON.parse(JSON.stringify(currentBudget));

    // Apply immediate scenario modifications
    if (scenarioInput.takeNewLoan) {
      const loan = scenarioInput.takeNewLoan;
      whatIfBS.liabilities.push(
        DebtEngine.createLiability(
          'personal_loan',
          loan.purpose,
          loan.principal,
          loan.annualInterestRate,
          loan.tenureMonths
        )
      );
      // Principal used or added
      whatIfBS.liabilitiesTotal += loan.principal;
    }

    // Additional SIP setup
    if (scenarioInput.monthlyAdditionalSIP > 0) {
      const equityAsset = whatIfBS.assets.find((a) => a.type === 'mutual_fund_equity');
      if (equityAsset) {
        equityAsset.monthlySIPAmount = (equityAsset.monthlySIPAmount || 0) + scenarioInput.monthlyAdditionalSIP;
      } else {
        whatIfBS.assets.push(
          InvestmentEngine.createDefaultAsset(
            'mutual_fund_equity',
            'Additional Equity SIP',
            0,
            scenarioInput.monthlyAdditionalSIP
          )
        );
      }
    }

    let baselineInterestPaid = 0;
    let whatIfInterestPaid = 0;

    // Simulate forward month by month
    for (let m = 1; m <= projectionMonths; m++) {
      const simulatedAge = currentAge + Math.floor(m / 12);
      // Realistic rotating market conditions (mild bull/stagnant/occasional correction)
      let market: MarketCondition = 'stagnant';
      if (m % 18 === 0) market = 'bear';
      else if (m % 8 === 0) market = 'bull';

      // 1. Tick Baseline
      const baseResult = AccountingEngine.processMonthlyTick(
        baseBS,
        baseBudget,
        market,
        m % 12 + 1,
        2026 + Math.floor(m / 12)
      );
      baseBS = baseResult.updatedBalanceSheet;

      // 2. Tick What-If
      // Check if job loss active
      let effectiveWhatIfBudget = { ...whatIfBudget };
      if (scenarioInput.jobLossPeriodMonths && m <= scenarioInput.jobLossPeriodMonths) {
        effectiveWhatIfBudget.baseSalary = 0;
      }

      // Check if delay investing active
      if (scenarioInput.delayInvestingByYears > 0 && m <= scenarioInput.delayInvestingByYears * 12) {
        // Paused investing during delay period
        effectiveWhatIfBudget.discretionaryWants.shopping += 3000;
      }

      // Add extra savings
      if (scenarioInput.monthlyAdditionalSavings > 0) {
        whatIfBS.emergencyFund += scenarioInput.monthlyAdditionalSavings;
      }

      const whatIfResult = AccountingEngine.processMonthlyTick(
        whatIfBS,
        effectiveWhatIfBudget,
        market,
        m % 12 + 1,
        2026 + Math.floor(m / 12)
      );
      whatIfBS = whatIfResult.updatedBalanceSheet;

      // Inflation calculation
      const inflationFactor = Math.pow(1 + (scenarioInput.assumedAnnualInflation || 0.06), m / 12);
      const basePurchasingPower = Math.round(baseBS.netWorth / inflationFactor);
      const whatIfPurchasingPower = Math.round(whatIfBS.netWorth / inflationFactor);

      chartPoints.push({
        monthIndex: m,
        age: simulatedAge,
        baselineNetWorth: baseBS.netWorth,
        whatIfNetWorth: whatIfBS.netWorth,
        baselineInvestments: baseBS.investmentsTotal,
        whatIfInvestments: whatIfBS.investmentsTotal,
        baselineDebt: baseBS.liabilitiesTotal,
        whatIfDebt: whatIfBS.liabilitiesTotal,
        baselinePurchasingPower: basePurchasingPower,
        whatIfPurchasingPower: whatIfPurchasingPower,
      });
    }

    const baselineFinalNetWorth = baseBS.netWorth;
    const whatIfFinalNetWorth = whatIfBS.netWorth;
    const netWorthDifference = whatIfFinalNetWorth - baselineFinalNetWorth;
    const percentageImpact = baselineFinalNetWorth > 0
      ? Math.round((netWorthDifference / baselineFinalNetWorth) * 100)
      : 100;

    // AI Coach Pedagogical Insights
    let aiCoachInsight = '';
    let keyEducationalTakeaway = '';

    if (scenarioInput.monthlyAdditionalSIP > 0) {
      aiCoachInsight = `Investing an additional ₹${scenarioInput.monthlyAdditionalSIP.toLocaleString('en-IN')}/month compounds into a difference of ₹${Math.abs(netWorthDifference).toLocaleString('en-IN')} over ${projectionMonths / 12} years.`;
      keyEducationalTakeaway = 'Small, consistent additions to compounding assets produce exponentially disproportionate outcomes due to geometric growth.';
    } else if (scenarioInput.takeNewLoan) {
      aiCoachInsight = `Taking this loan incurs ongoing EMI interest and reduces your projected net worth by ₹${Math.abs(netWorthDifference).toLocaleString('en-IN')}.`;
      keyEducationalTakeaway = 'Loans have an opportunity cost: every rupee paid in EMI interest is a rupee that could have been compounding in your portfolio.';
    } else if (scenarioInput.delayInvestingByYears > 0) {
      aiCoachInsight = `Delaying investing by ${scenarioInput.delayInvestingByYears} years creates a wealth gap of ₹${Math.abs(netWorthDifference).toLocaleString('en-IN')}. Even doubling your savings later rarely catches up to lost time.`;
      keyEducationalTakeaway = 'Time in the market is the most critical variable in the compound interest formula.';
    } else {
      aiCoachInsight = `This scenario results in a projected net worth change of ${percentageImpact > 0 ? '+' : ''}${percentageImpact}%.`;
      keyEducationalTakeaway = 'Every financial decision creates ripples that magnify over multi-year horizons.';
    }

    return {
      input: scenarioInput,
      baselineFinalNetWorth,
      whatIfFinalNetWorth,
      netWorthDifference,
      percentageImpact,
      baselineTotalInterestPaid: baselineInterestPaid,
      whatIfTotalInterestPaid: whatIfInterestPaid,
      baselineTotalWealthAccumulated: baseBS.investmentsTotal,
      whatIfTotalWealthAccumulated: whatIfBS.investmentsTotal,
      chartPoints,
      aiCoachInsight,
      keyEducationalTakeaway,
    };
  }
}
