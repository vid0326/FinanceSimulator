/**
 * Main Dashboard Screen — Simplistic Minimalist UI
 * Clean, calm financial snapshot with zero visual clutter.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useSimulationStore } from '../../store/useSimulationStore';
import { CurrencyText, formatINR } from '../components/CurrencyText';
import { HealthGauge } from '../components/HealthGauge';
import { InteractiveAvatar, AvatarMood } from '../components/InteractiveAvatar';
import { FlyingCoins } from '../components/FlyingCoins';
import { ConsequenceModal } from '../components/ConsequenceModal';
import { AuthModal } from '../components/AuthModal';
import { PromotionModal } from '../components/PromotionModal';
import { LeaderboardModal } from '../components/LeaderboardModal';
import { NetWorthChart } from '../components/NetWorthChart';
import { useAuthStore } from '../../store/useAuthStore';

export const DashboardScreen: React.FC = () => {
  const [coinBurstKey, setCoinBurstKey] = useState(0);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [leaderboardModalVisible, setLeaderboardModalVisible] = useState(false);

  const { isAuthenticated, user, syncToCloud } = useAuthStore();

  const profile = useSimulationStore((state) => state.profile);
  const balanceSheet = useSimulationStore((state) => state.balanceSheet);
  const budget = useSimulationStore((state) => state.budget);
  const health = useSimulationStore((state) => state.healthScore);
  const currentEvent = useSimulationStore((state) => state.currentEvent);
  const lastConsequence = useSimulationStore((state) => state.lastConsequence);
  const historicalSnapshots = useSimulationStore((state) => state.historicalSnapshots);

  const advanceMonth = useSimulationStore((state) => state.advanceMonth);
  const dismissConsequence = useSimulationStore((state) => state.dismissConsequence);
  const setActiveTab = useSimulationStore((state) => state.setActiveTab);
  const resetSimulation = useSimulationStore((state) => state.resetSimulation);

  const handleSwitchCharacter = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Return to the character selection screen to choose or create a different profile?')) {
        resetSimulation();
      }
    } else {
      Alert.alert(
        'Switch Profile / Character',
        'Return to the first page to choose a different character archetype or start from zero with a new profile?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Switch Character',
            onPress: () => resetSimulation(),
          },
        ]
      );
    }
  };

  // Map financial state to Avatar mood
  let mood: AvatarMood = 'happy';
  if (health.totalScore >= 85 && balanceSheet.netWorth > 100000) {
    mood = 'confident';
  } else if (currentEvent) {
    mood = 'thoughtful';
  } else if (balanceSheet.liquidCash < 2000 || health.totalScore < 45) {
    mood = 'panic';
  } else if (balanceSheet.liabilitiesTotal > 50000 || health.totalScore < 65) {
    mood = 'stressed';
  }

  const handleAdvance = () => {
    setCoinBurstKey((prev) => prev + 1);
    advanceMonth();
    if (isAuthenticated) {
      syncToCloud();
    }
  };

  const monthlyNetCashFlow =
    budget.baseSalary -
    (budget.fixedNeeds.rent +
      budget.fixedNeeds.utilities +
      budget.fixedNeeds.groceries +
      budget.fixedNeeds.healthInsurance +
      budget.discretionaryWants.entertainment +
      budget.discretionaryWants.diningOut +
      budget.discretionaryWants.shopping +
      balanceSheet.liabilities.reduce((s, l) => s + l.monthlyEMI, 0) +
      balanceSheet.assets.reduce((s, a) => s + (a.monthlySIPAmount || 0), 0));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Minimal Header */}
        <View style={styles.topBar}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <View style={styles.nameRow}>
              <Text style={styles.nameTitle} numberOfLines={1}>{profile.name}</Text>
              <TouchableOpacity
                style={[styles.cloudPill, isAuthenticated && styles.cloudPillActive]}
                onPress={() => setAuthModalVisible(true)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isAuthenticated ? 'cloud-done' : 'cloud-outline'}
                  size={12}
                  color={isAuthenticated ? '#000000' : '#888888'}
                />
                <Text style={[styles.cloudPillText, isAuthenticated && styles.cloudPillTextActive]}>
                  {isAuthenticated ? user?.displayName || 'Cloud' : 'Sync'}
                </Text>
              </TouchableOpacity>

              {/* Switch Profile / Character Button */}
              <TouchableOpacity
                style={styles.switchCharBtn}
                onPress={handleSwitchCharacter}
                activeOpacity={0.8}
              >
                <Ionicons name="swap-horizontal" size={13} color="#FFFFFF" />
                <Text style={styles.switchCharBtnText}>Switch Profile</Text>
              </TouchableOpacity>

              {/* Global Leaderboard Button */}
              <TouchableOpacity
                style={styles.leaderboardBtn}
                onPress={() => setLeaderboardModalVisible(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="trophy-outline" size={13} color="#FFFFFF" />
                <Text style={styles.leaderboardBtnText}>Ranks</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.metaText} numberOfLines={1}>
              Age {profile.currentAge} · Month {profile.currentMonth} · {profile.career}
            </Text>
          </View>
          <InteractiveAvatar mood={mood} size={50} />
        </View>

        {/* Hero Net Worth — Clean & Commanding */}
        <View style={styles.heroSection}>
          <Text style={styles.heroLabel}>NET WORTH</Text>
          <CurrencyText amount={balanceSheet.netWorth} style={styles.heroAmount} />
          <View style={[styles.cashFlowPill, monthlyNetCashFlow >= 0 ? styles.cashFlowPillPos : styles.cashFlowPillNeg]}>
            <Ionicons
              name={monthlyNetCashFlow >= 0 ? 'arrow-up' : 'arrow-down'}
              size={12}
              color={monthlyNetCashFlow >= 0 ? '#10B981' : '#F43F5E'}
            />
            <Text style={[styles.cashFlowText, monthlyNetCashFlow >= 0 ? styles.cashFlowTextPos : styles.cashFlowTextNeg]}>
              {monthlyNetCashFlow >= 0 ? '+' : ''}{formatINR(monthlyNetCashFlow)}/mo cash flow
            </Text>
          </View>
        </View>

        {/* Main Action Button */}
        <TouchableOpacity
          style={styles.advanceButton}
          activeOpacity={0.85}
          onPress={handleAdvance}
        >
          <Text style={styles.advanceButtonText}>
            Advance to Month {profile.currentMonth === 12 ? 1 : profile.currentMonth + 1} →
          </Text>
        </TouchableOpacity>

        {/* Wealth Velocity SVG Area Graph */}
        <NetWorthChart
          snapshots={historicalSnapshots}
          currentNetWorth={balanceSheet.netWorth}
        />

        {/* Pending Decision Banner (clean single-line notice) */}
        {currentEvent && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.eventNotice}
            onPress={() => setActiveTab('life')}
          >
            <View style={styles.eventNoticeLeft}>
              <Ionicons name="alert-circle" size={18} color="#FFFFFF" />
              <View style={styles.eventNoticeTextWrap}>
                <Text style={styles.eventNoticeTag}>DECISION PENDING</Text>
                <Text style={styles.eventNoticeTitle} numberOfLines={1}>
                  {currentEvent.title}
                </Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={16} color="#A3A3A3" />
          </TouchableOpacity>
        )}

        {/* Financial Accounts List (Clean Rows instead of 2x2 bulky cards) */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeader}>ACCOUNTS & BALANCES</Text>
          <View style={styles.accountsCard}>
            <TouchableOpacity
              style={styles.accountRow}
              activeOpacity={0.7}
              onPress={() => setActiveTab('life')}
            >
              <View style={styles.accountRowLeft}>
                <Ionicons name="wallet-outline" size={18} color="#FFFFFF" />
                <Text style={styles.accountName}>Liquid Cash</Text>
              </View>
              <CurrencyText amount={balanceSheet.liquidCash} style={styles.accountVal} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.accountRow}
              activeOpacity={0.7}
              onPress={() => setActiveTab('coach')}
            >
              <View style={styles.accountRowLeft}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
                <Text style={styles.accountName}>Emergency Fund</Text>
              </View>
              <CurrencyText amount={balanceSheet.emergencyFund} style={styles.accountVal} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.accountRow}
              activeOpacity={0.7}
              onPress={() => setActiveTab('portfolio')}
            >
              <View style={styles.accountRowLeft}>
                <Ionicons name="trending-up-outline" size={18} color="#FFFFFF" />
                <Text style={styles.accountName}>Investments</Text>
              </View>
              <CurrencyText amount={balanceSheet.investmentsTotal} style={styles.accountVal} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.accountRow, styles.accountRowLast]}
              activeOpacity={0.7}
              onPress={() => setActiveTab('life')}
            >
              <View style={styles.accountRowLeft}>
                <Ionicons name="card-outline" size={18} color="#FFFFFF" />
                <Text style={styles.accountName}>Total Liabilities</Text>
              </View>
              <CurrencyText amount={balanceSheet.liabilitiesTotal} style={styles.accountVal} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Health Summary Card */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeader}>FINANCIAL HEALTH</Text>
          <TouchableOpacity
            style={styles.healthCard}
            activeOpacity={0.8}
            onPress={() => setActiveTab('coach')}
          >
            <HealthGauge score={health.totalScore} grade={health.grade} size={76} strokeWidth={6} />
            <View style={styles.healthInfo}>
              <Text style={styles.healthScoreTitle}>
                Score: {health.totalScore}/100 · Grade {health.grade}
              </Text>
              <Text style={styles.healthStrengthText}>
                {health.keyStrength}
              </Text>
              <Text style={styles.healthCoachLink}>
                Tap to consult AI Coach →
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Celebration & Consequences */}
      <FlyingCoins triggerKey={coinBurstKey} />
      <ConsequenceModal
        visible={lastConsequence !== null}
        consequence={lastConsequence}
        onDismiss={dismissConsequence}
      />
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />
      <PromotionModal />
      <LeaderboardModal
        visible={leaderboardModalVisible}
        onClose={() => setLeaderboardModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 0,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  switchCharBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  switchCharBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  leaderboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  leaderboardBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cloudPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  cloudPillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  cloudPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888888',
  },
  cloudPillTextActive: {
    color: '#000000',
  },
  nameTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  metaText: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
    fontWeight: '600',
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888888',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  heroAmount: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  cashFlowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  cashFlowPillPos: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.28)',
  },
  cashFlowPillNeg: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.28)',
  },
  cashFlowText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cashFlowTextPos: {
    color: '#10B981',
  },
  cashFlowTextNeg: {
    color: '#F43F5E',
  },
  advanceButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  advanceButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '900',
  },
  eventNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 20,
  },
  eventNoticeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  eventNoticeTextWrap: {
    flex: 1,
  },
  eventNoticeTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  eventNoticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E5E5E5',
    marginTop: 2,
  },
  sectionWrap: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 1,
    marginBottom: 8,
  },
  accountsCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#1C1C1C',
  },
  accountRowLast: {
    borderBottomWidth: 0,
  },
  accountRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E5E5',
  },
  accountVal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  healthCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  healthInfo: {
    flex: 1,
  },
  healthScoreTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  healthStrengthText: {
    fontSize: 12,
    color: '#A3A3A3',
    marginTop: 3,
  },
  healthCoachLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 6,
  },
});
