/**
 * Career Progression & Promotion Engine
 * Handles job ladders, merit appraisals, salary hikes, performance bonuses,
 * and the pivotal "Lifestyle Inflation Dilemma" when income jumps.
 */

import { UserProfile, LifeStage } from '../types/profile';

export interface CareerLevel {
  levelIndex: number;
  title: string;
  stage: LifeStage;
  minMonthlySalary: number;
  maxMonthlySalary: number;
  tenureMonthsRequired: number;
  description: string;
}

export interface PromotionOffer {
  id: string;
  previousTitle: string;
  newTitle: string;
  previousSalary: number;
  newSalary: number;
  hikePercentage: number;
  performanceBonus: number;
  lifestyleInflationOptions: {
    id: string;
    title: string;
    description: string;
    sipIncreasePercentage: number;
    expenseIncreasePercentage: number;
    financialHealthImpact: number;
    lifeSatisfactionImpact: number;
  }[];
}

export class CareerEngine {
  public static CAREER_TRACKS: Record<string, CareerLevel[]> = {
    tech: [
      {
        levelIndex: 1,
        title: 'Junior Software Engineer',
        stage: 'first_job',
        minMonthlySalary: 45000,
        maxMonthlySalary: 65000,
        tenureMonthsRequired: 10,
        description: 'Writing unit tests, fixing bug tickets, learning system architecture.',
      },
      {
        levelIndex: 2,
        title: 'Software Development Engineer II (SDE-2)',
        stage: 'first_job',
        minMonthlySalary: 75000,
        maxMonthlySalary: 110000,
        tenureMonthsRequired: 14,
        description: 'Owning microservices, driving code reviews, leading feature launches.',
      },
      {
        levelIndex: 3,
        title: 'Senior Software Engineer / Tech Lead',
        stage: 'experienced',
        minMonthlySalary: 130000,
        maxMonthlySalary: 180000,
        tenureMonthsRequired: 18,
        description: 'Architecting high-scale infrastructure, mentoring juniors, leading sprint planning.',
      },
      {
        levelIndex: 4,
        title: 'Engineering Manager / Principal Architect',
        stage: 'experienced',
        minMonthlySalary: 220000,
        maxMonthlySalary: 320000,
        tenureMonthsRequired: 24,
        description: 'P&L accountability, cross-functional roadmaps, scaling engineering culture.',
      },
      {
        levelIndex: 5,
        title: 'Director of Technology / VP of Engineering',
        stage: 'independent',
        minMonthlySalary: 380000,
        maxMonthlySalary: 550000,
        tenureMonthsRequired: 36,
        description: 'Board-level strategic decisions, large organization leadership, equity grants.',
      },
    ],
    business: [
      {
        levelIndex: 1,
        title: 'Bootstrapped Solo Hustler',
        stage: 'zero',
        minMonthlySalary: 10000,
        maxMonthlySalary: 25000,
        tenureMonthsRequired: 8,
        description: 'Validating product market fit, doing customer support, cold emailing clients.',
      },
      {
        levelIndex: 2,
        title: 'Early Stage Founder / D2C Operator',
        stage: 'first_job',
        minMonthlySalary: 40000,
        maxMonthlySalary: 75000,
        tenureMonthsRequired: 12,
        description: 'Managing supply chain, running paid Meta ads, hiring first 3 team members.',
      },
      {
        levelIndex: 3,
        title: 'Growth-Stage Business Owner',
        stage: 'experienced',
        minMonthlySalary: 95000,
        maxMonthlySalary: 160000,
        tenureMonthsRequired: 16,
        description: 'Achieved sustainable positive cash flows, multi-channel distribution, managing 15+ staff.',
      },
      {
        levelIndex: 4,
        title: 'Established Managing Director',
        stage: 'experienced',
        minMonthlySalary: 220000,
        maxMonthlySalary: 350000,
        tenureMonthsRequired: 24,
        description: 'Franchising, automated operations, institutional credit lines, passive dividends.',
      },
      {
        levelIndex: 5,
        title: 'Enterprise Chairman & Angel Investor',
        stage: 'independent',
        minMonthlySalary: 450000,
        maxMonthlySalary: 750000,
        tenureMonthsRequired: 36,
        description: 'Board advisory, acquisitions, deploying angel investments, sovereign wealth diversification.',
      },
    ],
    creative: [
      {
        levelIndex: 1,
        title: 'Junior Freelance Designer / Copywriter',
        stage: 'intern',
        minMonthlySalary: 18000,
        maxMonthlySalary: 32000,
        tenureMonthsRequired: 8,
        description: 'Building portfolio on Behance / Upwork, handling revision requests, chasing invoices.',
      },
      {
        levelIndex: 2,
        title: 'Independent Creative Consultant',
        stage: 'first_job',
        minMonthlySalary: 45000,
        maxMonthlySalary: 80000,
        tenureMonthsRequired: 12,
        description: 'Retainer contracts with international clients, high hourly rates, digital asset royalties.',
      },
      {
        levelIndex: 3,
        title: 'Boutique Creative Agency Founder',
        stage: 'experienced',
        minMonthlySalary: 110000,
        maxMonthlySalary: 190000,
        tenureMonthsRequired: 18,
        description: 'Managing client campaigns, delegating production to junior freelancers, brand strategy.',
      },
      {
        levelIndex: 4,
        title: 'Executive Creative Director (Global)',
        stage: 'independent',
        minMonthlySalary: 250000,
        maxMonthlySalary: 400000,
        tenureMonthsRequired: 24,
        description: 'Keynote speaker, judging design awards, licensing proprietary intellectual property.',
      },
    ],
    general: [
      {
        levelIndex: 1,
        title: 'Entry-Level Associate / Clerk',
        stage: 'first_job',
        minMonthlySalary: 25000,
        maxMonthlySalary: 40000,
        tenureMonthsRequired: 10,
        description: 'Front-office administration, data entry, client relationship support.',
      },
      {
        levelIndex: 2,
        title: 'Senior Operations Associate',
        stage: 'first_job',
        minMonthlySalary: 45000,
        maxMonthlySalary: 65000,
        tenureMonthsRequired: 14,
        description: 'Process optimization, vendor reconciliation, team quality lead.',
      },
      {
        levelIndex: 3,
        title: 'Assistant Branch Manager',
        stage: 'experienced',
        minMonthlySalary: 80000,
        maxMonthlySalary: 120000,
        tenureMonthsRequired: 18,
        description: 'Auditing financials, compliance oversight, customer dispute escalations.',
      },
      {
        levelIndex: 4,
        title: 'Regional Operations Head',
        stage: 'experienced',
        minMonthlySalary: 160000,
        maxMonthlySalary: 240000,
        tenureMonthsRequired: 24,
        description: 'P&L performance across 12 zonal branches, corporate audits, executive reporting.',
      },
    ],
  };

  /**
   * Evaluates if the player qualifies for a corporate appraisal or career promotion.
   */
  public static evaluatePromotion(
    profile: UserProfile,
    currentSalary: number,
    monthsInCurrentRole: number,
    healthScore: number
  ): PromotionOffer | null {
    // Cannot be promoted if currently in initial 6 months of a role
    if (monthsInCurrentRole < 8) return null;

    // Detect appropriate track based on career title
    let trackName = 'general';
    const careerLower = profile.career.toLowerCase();
    if (careerLower.includes('engineer') || careerLower.includes('developer') || careerLower.includes('tech') || careerLower.includes('sde')) {
      trackName = 'tech';
    } else if (careerLower.includes('business') || careerLower.includes('founder') || careerLower.includes('entrepreneur') || careerLower.includes('trader')) {
      trackName = 'business';
    } else if (careerLower.includes('design') || careerLower.includes('creative') || careerLower.includes('freelanc') || careerLower.includes('creator')) {
      trackName = 'creative';
    }

    const track = this.CAREER_TRACKS[trackName] || this.CAREER_TRACKS.general;

    // Find current level in track
    const currentLevelIdx = track.findIndex(
      (lvl) => lvl.title.toLowerCase() === profile.career.toLowerCase()
    );

    let nextLevel: CareerLevel;
    if (currentLevelIdx >= 0 && currentLevelIdx < track.length - 1) {
      nextLevel = track[currentLevelIdx + 1];
    } else if (currentLevelIdx < 0) {
      // Not yet on the ladder, assign tier 1 or 2 based on current salary
      nextLevel = track.find((l) => l.minMonthlySalary > currentSalary) || track[track.length - 1];
    } else {
      // Reached top of ladder! Merit salary hike without title change
      nextLevel = {
        levelIndex: track.length + 1,
        title: `Distinguished ${profile.career}`,
        stage: 'independent',
        minMonthlySalary: Math.round(currentSalary * 1.25),
        maxMonthlySalary: Math.round(currentSalary * 1.50),
        tenureMonthsRequired: 24,
        description: 'Senior veteran leadership delivering multi-crore enterprise impact.',
      };
    }

    // Stochastic promotion probability based on tenure & financial/mental health
    const baseChance = Math.min(0.85, (monthsInCurrentRole - 8) * 0.12);
    const healthModifier = healthScore >= 75 ? 0.20 : healthScore <= 45 ? -0.15 : 0;
    const finalPromotionChance = Math.max(0.1, baseChance + healthModifier);

    // Roll dice
    if (Math.random() > finalPromotionChance) {
      return null;
    }

    // Determine salary hike (+22% to +38%)
    const hikeRate = 0.22 + Math.random() * 0.16;
    const proposedSalary = Math.max(
      nextLevel.minMonthlySalary,
      Math.round(currentSalary * (1 + hikeRate))
    );
    const actualHikePct = Math.round(((proposedSalary - currentSalary) / Math.max(1, currentSalary)) * 100);

    // One-time performance bonus (1.2x of current monthly salary)
    const bonus = Math.round(currentSalary * (1.0 + Math.random() * 0.5));

    return {
      id: `promo_${Date.now()}`,
      previousTitle: profile.career,
      newTitle: nextLevel.title,
      previousSalary: currentSalary,
      newSalary: proposedSalary,
      hikePercentage: actualHikePct,
      performanceBonus: bonus,
      lifestyleInflationOptions: [
        {
          id: 'opt_frugal_investor',
          title: 'The Compounding Machine (80% Invested)',
          description: 'Keep your current lifestyle unchanged. Funnel 80% of the pay hike directly into mutual funds & emergency cushion.',
          sipIncreasePercentage: 0.80,
          expenseIncreasePercentage: 0.05,
          financialHealthImpact: 15,
          lifeSatisfactionImpact: 8,
        },
        {
          id: 'opt_balanced_upgrade',
          title: 'Balanced Reward (50% Saved, 50% Upgraded)',
          description: 'Move to a slightly better apartment, enjoy quality weekend dining, and save half of the new income.',
          sipIncreasePercentage: 0.50,
          expenseIncreasePercentage: 0.30,
          financialHealthImpact: 8,
          lifeSatisfactionImpact: 15,
        },
        {
          id: 'opt_lifestyle_trap',
          title: 'Lifestyle Inflation Trap (Luxury Splurge)',
          description: 'Upgrade to a high-end gated community, lease an expensive car on EMI, and buy designer clothes.',
          sipIncreasePercentage: 0.05,
          expenseIncreasePercentage: 0.85,
          financialHealthImpact: -12,
          lifeSatisfactionImpact: 22,
        },
      ],
    };
  }
}
