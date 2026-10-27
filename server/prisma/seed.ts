/**
 * Database Seed Script
 * Populates realistic simulation records for community leaderboards and peer benchmarking.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with initial community players...');

  const passwordHash = await bcrypt.hash('CommunityDemo123!', 10);

  // 1. Create Demo Community User 1: Kabir Mehta (Tech SDE)
  const user1 = await prisma.user.upsert({
    where: { email: 'kabir.demo@sim.dev' },
    update: {},
    create: {
      email: 'kabir.demo@sim.dev',
      passwordHash,
      displayName: 'Kabir Mehta',
      gameSaves: {
        create: {
          characterName: 'Kabir',
          characterArchetype: 'char_techie',
          currentAge: 27,
          currentMonth: 9,
          currentStage: 'first_job',
          totalMonthsSimulated: 38,
          netWorth: 1850000,
          healthScoreValue: 92,
          level: 8,
          isActive: true,
          balanceSheet: {
            cash: 250000,
            emergencyFund: 300000,
            netWorth: 1850000,
            assets: [
              { name: 'Nifty 50 Index Fund', value: 950000 },
              { name: 'Parag Parikh Flexi Cap', value: 350000 },
            ],
            liabilities: [],
          },
          budget: {
            monthlyIncome: 145000,
            needs: 45000,
            wants: 25000,
            savings: 75000,
          },
          healthScore: {
            totalScore: 92,
            emergencyFundMonths: 6.6,
            debtToIncomeRatio: 0,
            savingsRate: 51.7,
          },
          gamification: {
            level: 8,
            experiencePoints: 1950,
            unlockedBadges: ['first_job_starter', 'sip_master', 'promotion_champ', 'emergency_fortress', 'first_ten_lakhs'],
          },
          promotionLogs: {
            create: [
              {
                previousTitle: 'Associate Software Engineer',
                newTitle: 'Software Development Engineer II',
                previousSalary: 70000,
                newSalary: 110000,
                hikePercentage: 57,
                bonusAmount: 100000,
                lifestyleChoice: 'The Compounding Machine (80% Invested)',
                monthSimulated: 18,
              },
              {
                previousTitle: 'Software Development Engineer II',
                newTitle: 'Senior Software Engineer (SDE-3)',
                previousSalary: 110000,
                newSalary: 145000,
                hikePercentage: 32,
                bonusAmount: 180000,
                lifestyleChoice: 'Balanced Growth (50% Invested, 50% Lifestyle)',
                monthSimulated: 34,
              },
            ],
          },
        },
      },
    },
  });

  // 2. Create Demo Community User 2: Priya Deshmukh (Frugal / Balanced)
  const user2 = await prisma.user.upsert({
    where: { email: 'priya.demo@sim.dev' },
    update: {},
    create: {
      email: 'priya.demo@sim.dev',
      passwordHash,
      displayName: 'Priya Deshmukh',
      gameSaves: {
        create: {
          characterName: 'Priya',
          characterArchetype: 'char_frugal',
          currentAge: 25,
          currentMonth: 4,
          currentStage: 'first_job',
          totalMonthsSimulated: 24,
          netWorth: 1220000,
          healthScoreValue: 96,
          level: 6,
          isActive: true,
          balanceSheet: {
            cash: 180000,
            emergencyFund: 240000,
            netWorth: 1220000,
            assets: [
              { name: 'Government Sovereign Gold Bonds', value: 300000 },
              { name: 'Nifty Midcap 150 Index', value: 500000 },
            ],
            liabilities: [],
          },
          budget: {
            monthlyIncome: 85000,
            needs: 28000,
            wants: 12000,
            savings: 45000,
          },
          healthScore: {
            totalScore: 96,
            emergencyFundMonths: 8.5,
            debtToIncomeRatio: 0,
            savingsRate: 52.9,
          },
          gamification: {
            level: 6,
            experiencePoints: 1400,
            unlockedBadges: ['first_job_starter', 'sip_master', 'emergency_fortress', 'first_ten_lakhs'],
          },
        },
      },
    },
  });

  // 3. Create Demo Community User 3: Vikram Reddy (Entrepreneur)
  const user3 = await prisma.user.upsert({
    where: { email: 'vikram.demo@sim.dev' },
    update: {},
    create: {
      email: 'vikram.demo@sim.dev',
      passwordHash,
      displayName: 'Vikram Reddy',
      gameSaves: {
        create: {
          characterName: 'Vikram',
          characterArchetype: 'char_entrepreneur',
          currentAge: 29,
          currentMonth: 11,
          currentStage: 'first_job',
          totalMonthsSimulated: 48,
          netWorth: 4200000,
          healthScoreValue: 84,
          level: 11,
          isActive: true,
          balanceSheet: {
            cash: 500000,
            emergencyFund: 400000,
            netWorth: 4200000,
            assets: [
              { name: 'Startup Equity & Treasury', value: 2500000 },
              { name: 'Bluechip Equity Portfolio', value: 800000 },
            ],
            liabilities: [],
          },
          budget: {
            monthlyIncome: 220000,
            needs: 65000,
            wants: 45000,
            savings: 110000,
          },
          healthScore: {
            totalScore: 84,
            emergencyFundMonths: 8.1,
            debtToIncomeRatio: 0,
            savingsRate: 50,
          },
          gamification: {
            level: 11,
            experiencePoints: 2650,
            unlockedBadges: ['first_job_starter', 'sip_master', 'promotion_champ', 'emergency_fortress', 'first_ten_lakhs'],
          },
        },
      },
    },
  });

  console.log('Seeding finished successfully:');
  console.log(`- Created/Verified user: ${user1.displayName}`);
  console.log(`- Created/Verified user: ${user2.displayName}`);
  console.log(`- Created/Verified user: ${user3.displayName}`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
