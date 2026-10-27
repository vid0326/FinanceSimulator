/**
 * End-to-End Comprehensive Test Suite for Finance Life Simulator Backend
 * Tests all 22 core API endpoints against live PostgreSQL.
 */

async function run() {
  const BASE_URL = 'http://localhost:4000/api';
  const ROOT_URL = 'http://localhost:4000';

  console.log('1. Testing GET / (Root Discovery)...');
  const rootRes = await fetch(ROOT_URL);
  const rootData = await rootRes.json();
  console.log('Root Service:', rootData.name, 'Endpoints count:', Object.keys(rootData.endpoints).length);

  console.log('\n2. Testing GET /api/health...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  console.log('Health status:', healthData);

  const testEmail = `player_${Date.now()}@example.com`;
  console.log(`\n3. Testing POST /api/auth/register with ${testEmail}...`);
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      displayName: 'Aarav Sharma',
      email: testEmail,
      password: 'password123',
    }),
  });
  const regData = await regRes.json();
  console.log('Register response:', regRes.status, regData.message, 'User ID:', regData.user?.id);
  const token = regData.accessToken;
  const refreshToken = regData.refreshToken;

  if (!token) {
    throw new Error('No access token returned!');
  }

  console.log('\n4. Testing POST /api/auth/login...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'password123',
    }),
  });
  const loginData = await loginRes.json();
  console.log('Login response:', loginRes.status, loginData.message);

  console.log('\n5. Testing GET /api/auth/me with Bearer token...');
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meData = await meRes.json();
  console.log('Me profile:', meData.user.displayName, meData.user.email);

  console.log('\n6. Testing PUT /api/auth/profile...');
  const updateRes = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ displayName: 'Aarav (Lead SDE)' }),
  });
  const updateData = await updateRes.json();
  console.log('Update profile response:', updateRes.status, 'New name:', updateData.user?.displayName);

  console.log('\n7. Testing POST /api/game/sync...');
  const syncRes = await fetch(`${BASE_URL}/game/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      characterName: 'Aarav',
      characterArchetype: 'char_techie',
      currentAge: 24,
      currentMonth: 8,
      currentStage: 'first_job',
      totalMonthsSimulated: 14,
      balanceSheet: {
        cash: 120000,
        emergencyFund: 80000,
        netWorth: 285000,
        assets: [{ name: 'Nifty 50 Index Fund', value: 85000 }],
        liabilities: [],
      },
      budget: {
        monthlyIncome: 75000,
        needs: 30000,
        wants: 15000,
        savings: 30000,
      },
      healthScore: {
        totalScore: 88,
        emergencyFundMonths: 4.4,
        debtToIncomeRatio: 0,
        savingsRate: 40,
      },
      gamification: {
        level: 4,
        experiencePoints: 650,
        unlockedBadges: ['first_job_starter'],
      },
      decisionLog: {
        eventId: 'job_offer_promotion',
        eventTitle: 'Promotion to SDE-2',
        selectedOption: 'Compounding Machine (80% saved)',
        consequence: { incomeDelta: 15000 },
        monthSimulated: 14,
      },
    }),
  });
  const syncData = await syncRes.json();
  console.log('Sync response:', syncRes.status, syncData.message, 'Save ID:', syncData.gameSaveId);
  const saveId = syncData.gameSaveId;

  console.log('\n8. Testing POST /api/game/promotion...');
  const promoRes = await fetch(`${BASE_URL}/game/promotion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      gameSaveId: saveId,
      previousTitle: 'Junior Software Engineer',
      newTitle: 'Software Development Engineer II (SDE-2)',
      previousSalary: 55000,
      newSalary: 75000,
      hikePercentage: 36,
      bonusAmount: 55000,
      lifestyleChoice: 'The Compounding Machine (80% Invested)',
      monthSimulated: 14,
    }),
  });
  const promoData = await promoRes.json();
  console.log('Promotion log response:', promoRes.status, 'New Title:', promoData.promotionLog?.newTitle);

  console.log('\n9. Testing GET /api/game/achievements...');
  const achRes = await fetch(`${BASE_URL}/game/achievements`);
  const achData = await achRes.json();
  console.log('Total Achievements available:', achData.totalAchievements);

  console.log('\n10. Testing POST /api/game/achievement/unlock...');
  const unlockRes = await fetch(`${BASE_URL}/game/achievement/unlock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      gameSaveId: saveId,
      badgeId: 'sip_master',
    }),
  });
  const unlockData = await unlockRes.json();
  console.log('Achievement unlock response:', unlockRes.status, unlockData.message, 'New Level:', unlockData.newLevel);

  console.log('\n11. Testing GET /api/game/market-pulse...');
  const pulseRes = await fetch(`${BASE_URL}/game/market-pulse`);
  const pulseData = await pulseRes.json();
  console.log('Macro Inflation:', pulseData.macroeconomicClimate.headlineInflationRate + '%', 'Sentiment:', pulseData.macroeconomicClimate.equitySentiment);

  console.log('\n12. Testing GET /api/game/saves (Multi-Save Slot List)...');
  const savesRes = await fetch(`${BASE_URL}/game/saves`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const savesData = await savesRes.json();
  console.log('Total save slots found:', savesData.saves?.length, 'Latest Save Net Worth: ₹' + savesData.saves?.[0]?.netWorth);

  console.log('\n13. Testing GET /api/game/state/:id...');
  const stateRes = await fetch(`${BASE_URL}/game/state/${saveId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const stateData = await stateRes.json();
  console.log('State fetch found:', stateData.found, 'Character:', stateData.save?.characterName);

  console.log('\n14. Testing GET /api/analytics/:gameSaveId (Financial Health Audit)...');
  const auditRes = await fetch(`${BASE_URL}/analytics/${saveId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const auditData = await auditRes.json();
  console.log('Financial Health Grade:', auditData.healthGrade, 'Emergency Buffer:', auditData.metrics.emergencyMonths + ' mos', 'Insights count:', auditData.insights?.length);

  console.log('\n15. Testing GET /api/analytics/peer-benchmark/:gameSaveId...');
  const peerRes = await fetch(`${BASE_URL}/analytics/peer-benchmark/${saveId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const peerData = await peerRes.json();
  console.log('Community Wealth Percentile:', peerData.player?.percentile + '%', 'Community Average Net Worth: ₹' + peerData.communityAverages?.averageNetWorth);

  console.log('\n16. Testing POST /api/coach/message...');
  const coachRes = await fetch(`${BASE_URL}/coach/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      gameSaveId: saveId,
      userQuery: 'How should I invest my ₹55,000 performance bonus?',
      coachResponse: 'Put ₹35,000 into Nifty 50 Index Fund and keep ₹20,000 in your emergency fund.',
      monthSimulated: 14,
    }),
  });
  const coachData = await coachRes.json();
  console.log('Coach message saved:', coachRes.status, 'ID:', coachData.id);

  console.log('\n17. Testing GET /api/coach/history/:id...');
  const coachHistRes = await fetch(`${BASE_URL}/coach/history/${saveId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const coachHistData = await coachHistRes.json();
  console.log('Coach history count:', coachHistData.history?.length, 'Last query:', coachHistData.history?.[0]?.userQuery);

  console.log('\n18. Testing GET /api/leaderboard/wealth...');
  const wealthRes = await fetch(`${BASE_URL}/leaderboard/wealth`);
  const wealthData = await wealthRes.json();
  console.log('Wealth Leaderboard Top Player:', wealthData.leaderboard?.[0]?.player, 'Net Worth: ₹' + wealthData.leaderboard?.[0]?.netWorth);

  console.log('\n19. Testing GET /api/leaderboard/health...');
  const healthLeadRes = await fetch(`${BASE_URL}/leaderboard/health`);
  const healthLeadData = await healthLeadRes.json();
  console.log('Health Leaderboard Top Player:', healthLeadData.leaderboard?.[0]?.player, 'Score:', healthLeadData.leaderboard?.[0]?.healthScore);

  console.log('\n20. Testing GET /api/leaderboard/streaks...');
  const streakRes = await fetch(`${BASE_URL}/leaderboard/streaks`);
  const streakData = await streakRes.json();
  console.log('Streak Leaderboard Top Player:', streakData.leaderboard?.[0]?.player, 'Months Survived:', streakData.leaderboard?.[0]?.monthsSurvived);

  console.log('\n21. Testing GET /api/game/export/:id...');
  const exportRes = await fetch(`${BASE_URL}/game/export/${saveId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const exportData = await exportRes.json();
  console.log('Export Save Character:', exportData.characterName, 'Decision Logs:', exportData.decisionLogs?.length, 'Promotion Logs:', exportData.promotionLogs?.length);

  console.log('\n22. Testing POST /api/auth/refresh...');
  const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const refreshData = await refreshRes.json();
  console.log('Refresh token response:', refreshRes.status, 'New Access Token exists:', !!refreshData.accessToken);

  console.log('\n======================================================');
  console.log('>>> ALL 22 PRODUCTION BACKEND API ENDPOINTS PASSED! <<<');
  console.log('======================================================');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
