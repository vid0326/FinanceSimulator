/**
 * Playable Character Archetypes & Special Traits
 * Each character represents a distinct real-world financial path, starting conditions, and gameplay perks.
 */

import { LifeStage } from './profile';

export interface CharacterArchetype {
  id: string;
  name: string;
  avatarSeed: string;
  age: number;
  title: string;
  tagline: string;
  biography: string;
  stageId: LifeStage;
  startingCash: number;
  startingSavings: number;
  startingDebt: number;
  monthlyIncome: number;
  fixedExpenses: number;
  perk: {
    title: string;
    description: string;
    effectType: 'income_boost' | 'expense_discount' | 'bonus_multiplier' | 'frugal_shield' | 'high_compounding';
    value: number; // e.g. 0.15 for 15%
  };
  startingAssets?: Array<{
    name: string;
    type: 'mutual_fund_equity' | 'fixed_deposit' | 'gold' | 'stocks';
    value: number;
    sip: number;
  }>;
}

export const CHARACTER_ROSTER: CharacterArchetype[] = [
  {
    id: 'char_ground_zero',
    name: 'Kabir',
    avatarSeed: 'avatar_ground_zero',
    age: 18,
    title: 'The Ground-Zero Striker',
    tagline: 'Starts with ₹0. No handouts, no safety net. Pure grit.',
    biography: 'Just finished high school with zero financial backing. Must find gigs, take smart entry-level risks, and build everything from scratch.',
    stageId: 'zero',
    startingCash: 0,
    startingSavings: 0,
    startingDebt: 0,
    monthlyIncome: 0,
    fixedExpenses: 0,
    perk: {
      title: 'Hunger & Resilience',
      description: 'Zero lifestyle baggage: -20% cheaper living expenses when starting out.',
      effectType: 'expense_discount',
      value: 0.20,
    },
  },
  {
    id: 'char_techie',
    name: 'Aarav',
    avatarSeed: 'avatar_techie',
    age: 23,
    title: 'The Corporate Software Engineer',
    tagline: 'High starting salary, but high temptation for lifestyle inflation.',
    biography: 'Cracked campus placements at an MNC in Bengaluru. Has great starting cash flow, but peer pressure for expensive gadgets and weekend pub crawls is real.',
    stageId: 'first_job',
    startingCash: 25000,
    startingSavings: 35000,
    startingDebt: 0,
    monthlyIncome: 65000,
    fixedExpenses: 32000,
    perk: {
      title: 'Tech Appraisal Machine',
      description: '+15% higher salary hikes during corporate appraisals and job switches.',
      effectType: 'income_boost',
      value: 0.15,
    },
  },
  {
    id: 'char_freelancer',
    name: 'Priya',
    avatarSeed: 'avatar_freelancer',
    age: 22,
    title: 'The Digital Freelancer & Creator',
    tagline: 'Variable cash flow, zero corporate PF, but uncapped income potential.',
    biography: 'Works remotely doing UI/UX design and video production. Some months she makes ₹90k, other months ₹15k. Managing emergency runway is her superpower.',
    stageId: 'intern',
    startingCash: 12000,
    startingSavings: 20000,
    startingDebt: 0,
    monthlyIncome: 35000,
    fixedExpenses: 18000,
    perk: {
      title: 'Festival Windfall Gig',
      description: '+30% bonus cash during client surge seasons (Diwali / Year-end).',
      effectType: 'bonus_multiplier',
      value: 0.30,
    },
  },
  {
    id: 'char_student_debt',
    name: 'Meera',
    avatarSeed: 'avatar_student_debt',
    age: 24,
    title: 'The Ambitious MBA / Late-Bloomer',
    tagline: 'Heavy education loan burden, but high-velocity career upside.',
    biography: 'Just graduated from a premier business school with a ₹12,00,000 education loan. Needs disciplined EMI repayment before she can afford luxury.',
    stageId: 'first_job',
    startingCash: 15000,
    startingSavings: 10000,
    startingDebt: 1200000,
    monthlyIncome: 95000,
    fixedExpenses: 42000,
    perk: {
      title: 'Fast-Track Leadership',
      description: 'Faster promotion velocity: Promoted every 8 months if financial health is >75.',
      effectType: 'high_compounding',
      value: 0.25,
    },
  },
  {
    id: 'char_trader_biz',
    name: 'Vikram',
    avatarSeed: 'avatar_trader_biz',
    age: 26,
    title: 'The D2C & Retail Entrepreneur',
    tagline: 'High risk, working capital cycles, and massive scaling upside.',
    biography: 'Runs a bootstrapped e-commerce brand. Balances inventory costs, GST filings, and cash crunch cycles. High risk of failure, but potential 10x returns.',
    stageId: 'experienced',
    startingCash: 50000,
    startingSavings: 80000,
    startingDebt: 150000,
    monthlyIncome: 80000,
    fixedExpenses: 45000,
    perk: {
      title: 'Margin Maximizer',
      description: 'Business reinvestment: +20% extra returns on high-risk business choices.',
      effectType: 'income_boost',
      value: 0.20,
    },
  },
  {
    id: 'char_govt_aspirant',
    name: 'Ananya',
    avatarSeed: 'avatar_govt',
    age: 21,
    title: 'The Public Sector & Stability Seeker',
    tagline: 'Low early income with study expenses, followed by rock-solid job security.',
    biography: 'Preparing for civil services and banking exams. Lives frugally on family allowance. Once cleared, gets government quarters, pension, and guaranteed job safety.',
    stageId: 'student',
    startingCash: 5000,
    startingSavings: 12000,
    startingDebt: 0,
    monthlyIncome: 8000,
    fixedExpenses: 6000,
    perk: {
      title: 'Frugal Shield',
      description: 'Immune to high peer-pressure lifestyle temptations; saves 90% of windfalls.',
      effectType: 'frugal_shield',
      value: 0.25,
    },
  },
];
