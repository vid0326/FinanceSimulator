/**
 * AI Financial Coach Engine
 * Provides instant contextual explanations, pedagogical guidance, and offline diagnostic intelligence.
 */

import { BalanceSheet, MonthlyCashFlowReport } from '../core/types/finance';
import { HealthScoreBreakdown } from '../core/types/health';
import { UserProfile } from '../core/types/profile';
import { EventDecisionLog } from '../core/types/events';
import { BehaviorRules, BehavioralDiagnosis } from './behaviorRules';

export interface CoachMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: number;
  highlightCategory?: 'saving' | 'debt' | 'investing' | 'emergency' | 'mindset';
  suggestedPromptOptions?: string[];
}

export class CoachEngine {
  /**
   * Generates a contextual welcome review when opening the coach screen
   */
  public static generateWelcomeBrief(
    profile: UserProfile,
    balanceSheet: BalanceSheet,
    health: HealthScoreBreakdown,
    decisionLogs: EventDecisionLog[]
  ): CoachMessage {
    const diagnosis: BehavioralDiagnosis = BehaviorRules.diagnoseBehavior(
      decisionLogs,
      balanceSheet,
      health
    );

    const netWorthFormatted = `₹${Math.round(balanceSheet.netWorth).toLocaleString('en-IN')}`;
    const text = `Hey ${profile.name}! 👋 I’m your AI Financial Coach.

Here is your simulated life snapshot at Age ${profile.currentAge}:
• Net Worth: ${netWorthFormatted}
• Financial Health Score: ${health.totalScore}/100 (Grade ${health.grade})
• Behavioral Archetype: **${diagnosis.primaryTrait}**

${diagnosis.description}

💡 **Next Milestone Challenge**: ${diagnosis.recommendedChallenge}`;

    return {
      id: `msg_welcome_${Date.now()}`,
      sender: 'coach',
      text,
      timestamp: Date.now(),
      suggestedPromptOptions: [
        'Why is my health score at this level?',
        'Should I repay debt or invest in SIP?',
        'How does compounding work for my age?',
        'What should I do about an emergency fund?',
      ],
    };
  }

  /**
   * Evaluates user query and returns instant offline pedagogical answers with financial context.
   */
  public static answerUserQuery(
    query: string,
    profile: UserProfile,
    balanceSheet: BalanceSheet,
    cashFlow: MonthlyCashFlowReport,
    health: HealthScoreBreakdown,
    decisionLogs: EventDecisionLog[]
  ): CoachMessage {
    const q = query.toLowerCase();
    let text = '';
    let category: CoachMessage['highlightCategory'] = 'mindset';

    if (q.includes('health') || q.includes('score') || q.includes('why')) {
      category = 'saving';
      text = `Your current Financial Health Score is **${health.totalScore}/100 (${health.grade})**.

Here is how your score breaks down:
• **Savings & SIP Rate**: ${health.savingsRateScore}/20
• **Debt Management**: ${health.debtManagementScore}/20
• **Emergency Cushion**: ${health.emergencyFundScore}/15
• **Diversification**: ${health.diversificationScore}/15
• **Investment Discipline**: ${health.investmentDisciplineScore}/20
• **Cash Flow Stability**: ${health.cashFlowStabilityScore}/10

⭐ **Key Strength**: ${health.keyStrength}
⚠️ **Main Vulnerability**: ${health.keyVulnerability}

To boost your score next month: Focus on improving your ${health.keyVulnerability.toLowerCase()}!`;
    } else if (q.includes('debt') || q.includes('loan') || q.includes('repay') || q.includes('emi')) {
      category = 'debt';
      if (balanceSheet.liabilitiesTotal > 0) {
        text = `You currently have **₹${balanceSheet.liabilitiesTotal.toLocaleString('en-IN')}** in outstanding liabilities, costing **₹${cashFlow.totalEMIs.toLocaleString('en-IN')}** each month in EMIs.

**The Golden Rule of Debt vs Investing**:
1. If your debt interest rate is **> 12%** (e.g. credit cards at 36%-42% or personal loans at 14%-18%), **repay that debt immediately**. No mutual fund can reliably beat 15%-40% guaranteed interest loss.
2. If your debt is low-interest (e.g. education or home loan at 8.5%), you can balance regular EMIs while continuing an equity SIP.`;
      } else {
        text = `Awesome news: You have **₹0 in debt**! 🎉

Because you have no EMI obligations, 100% of your surplus income can flow into wealth creation through emergency savings and compounding equity SIPs. Continue avoiding high-interest consumer EMIs!`;
      }
    } else if (q.includes('compound') || q.includes('compounding') || q.includes('grow')) {
      category = 'investing';
      text = `Compounding is what Albert Einstein reportedly called the "Eighth Wonder of the World".

Here is how it works for you right now at age ${profile.currentAge}:
If you invest **₹5,000 every month** into a diversified index fund assuming an illustrative 12% annual return:
• In 5 years: You invest ₹3 Lakhs → Portfolio reaches **₹4.1 Lakhs**
• In 10 years: You invest ₹6 Lakhs → Portfolio reaches **₹11.6 Lakhs**
• In 20 years: You invest ₹12 Lakhs → Portfolio reaches **₹49.9 Lakhs**!

Notice that between year 10 and 20, your money grows by ₹38 Lakhs while you only added ₹6 Lakhs of your own money. That exponential hockey stick is pure compound interest!`;
    } else if (q.includes('emergency') || q.includes('buffer') || q.includes('liquid')) {
      category = 'emergency';
      const monthlyBurn = cashFlow.totalFixedExpenses || 20000;
      const targetBuffer = monthlyBurn * 4;
      const currentBuffer = balanceSheet.liquidCash + balanceSheet.emergencyFund;
      text = `An **Emergency Fund** is your financial airbag. It prevents unexpected disruptions (medical bills, job gaps, gadget repairs) from forcing you into high-interest debt or distress-selling your investments.

• Your estimated monthly essential expenses: **₹${monthlyBurn.toLocaleString('en-IN')}**
• Recommended 4-month emergency cushion: **₹${targetBuffer.toLocaleString('en-IN')}**
• Your current liquid buffer: **₹${currentBuffer.toLocaleString('en-IN')}**

${currentBuffer >= targetBuffer ? '✅ Your emergency fund is well funded!' : '⚠️ Build this cushion in a liquid savings account or Sweep-in FD before ramping up aggressive equity investments.'}`;
    } else if (q.includes('diversif') || q.includes('portfolio') || q.includes('asset')) {
      category = 'investing';
      const validAssets = balanceSheet.assets.filter((a) => a.currentValue > 0);
      text = `**Diversification** means not putting all your eggs in one basket.

You currently hold **${validAssets.length} asset class(es)** totaling ₹${balanceSheet.investmentsTotal.toLocaleString('en-IN')}.

Why diversification matters:
• **Equities (Index Funds/Stocks)**: Provide inflation-beating long-term growth, but experience short-term volatility.
• **Debt (FDs/Bonds)**: Provide stability and guaranteed capital preservation.
• **Gold**: Acts as a crisis hedge during market crashes and currency depreciation.

A balanced starter allocation for young adults is typically **60% Equity / 30% Debt & FD / 10% Gold**.`;
    } else {
      text = `Great financial question!

As your coach, remember the core decision loop:
1. **Needs First**: Cover rent, utilities, and groceries.
2. **Safety Second**: Maintain 3-6 months in liquid emergency savings.
3. **Eliminate Toxic Debt**: Pay off credit card roll-overs and high-cost EMIs.
4. **Invest Systematically**: Automate monthly SIPs in diversified index funds.
5. **Protect**: Ensure term and health insurance as your liabilities grow.

Feel free to ask me specifically about your **health score**, **debt vs investing**, or **compounding**!`;
    }

    return {
      id: `msg_coach_${Date.now()}`,
      sender: 'coach',
      text,
      timestamp: Date.now(),
      highlightCategory: category,
      suggestedPromptOptions: [
        'How does compounding work for my age?',
        'Why is my health score at this level?',
        'Should I repay debt or invest in SIP?',
        'What is an emergency fund and why do I need one?',
      ],
    };
  }
}
