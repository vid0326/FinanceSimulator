/**
 * LeaderboardModal — High-Contrast Minimalist B&W Community Leaderboard
 * Fetches and displays global real-time rankings for Net Worth and Financial Health Score.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient, LeaderboardEntry } from '../../services/apiClient';
import { useAuthStore } from '../../store/useAuthStore';
import { useSimulationStore } from '../../store/useSimulationStore';
import { formatINR } from './CurrencyText';

interface LeaderboardModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'wealth' | 'health'>('wealth');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuthStore();
  const balanceSheet = useSimulationStore((state) => state.balanceSheet);
  const health = useSimulationStore((state) => state.healthScore);
  const profile = useSimulationStore((state) => state.profile);

  const fetchRankings = async (category: 'wealth' | 'health') => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (category === 'wealth') {
        const res = await apiClient.fetchWealthLeaderboard();
        setEntries(res.leaderboard || []);
      } else {
        const res = await apiClient.fetchHealthLeaderboard();
        setEntries(res.leaderboard || []);
      }
    } catch (err: any) {
      console.error('Fetch leaderboard error:', err);
      setErrorMsg(
        err?.message?.includes('Network') || err?.message?.includes('fetch')
          ? `Cannot reach backend at ${apiClient.getBaseUrl()}. Ensure phone and computer are on the same Wi-Fi.`
          : 'Unable to load leaderboard. Please check backend connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchRankings(activeTab);
    }
  }, [visible, activeTab]);

  const getGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 50) return 'C';
    return 'D';
  };

  const renderItem = ({ item }: { item: LeaderboardEntry }) => {
    const isCurrentUser =
      isAuthenticated &&
      ((user?.displayName && item.player === user.displayName) ||
        (item.characterName === profile.name && item.netWorth === balanceSheet.netWorth));

    const isTop1 = item.rank === 1;
    const isTop2 = item.rank === 2;
    const isTop3 = item.rank === 3;

    return (
      <View style={[styles.row, isCurrentUser && styles.currentRow]}>
        {/* Rank Badge */}
        <View
          style={[
            styles.rankBadge,
            isTop1 && styles.rankBadge1,
            isTop2 && styles.rankBadge2,
            isTop3 && styles.rankBadge3,
          ]}
        >
          <Text
            style={[
              styles.rankText,
              (isTop1 || isTop2 || isTop3) && styles.rankTextTop,
            ]}
          >
            {item.rank === 1 ? '1' : item.rank === 2 ? '2' : item.rank === 3 ? '3' : `#${item.rank}`}
          </Text>
        </View>

        {/* Player & Character Info */}
        <View style={styles.playerInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.playerName, isCurrentUser && styles.playerNameHighlight]} numberOfLines={1}>
              {item.player}
            </Text>
            {isCurrentUser && (
              <View style={styles.youTag}>
                <Text style={styles.youTagText}>YOU</Text>
              </View>
            )}
          </View>
          <Text style={styles.characterMeta} numberOfLines={1}>
            {item.characterName} · {item.archetype} · {item.monthsSurvived} mos
          </Text>
        </View>

        {/* Metric Value */}
        <View style={styles.metricWrap}>
          {activeTab === 'wealth' ? (
            <Text style={styles.primaryMetricText}>{formatINR(item.netWorth, true)}</Text>
          ) : (
            <View style={styles.healthMetricRow}>
              <Text style={styles.primaryMetricText}>{item.healthScore}</Text>
              <View style={styles.gradeBadge}>
                <Text style={styles.gradeText}>{getGrade(item.healthScore)}</Text>
              </View>
            </View>
          )}
          <Text style={styles.metricSubtext}>
            {activeTab === 'wealth' ? `Health ${item.healthScore}` : formatINR(item.netWorth, true)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.trophyIconWrap}>
                <Ionicons name="trophy" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Global Rankings</Text>
                <Text style={styles.headerSubtitle}>Verified community leaderboard</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'wealth' && styles.tabBtnActive]}
              onPress={() => setActiveTab('wealth')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="cash-outline"
                size={15}
                color={activeTab === 'wealth' ? '#000000' : '#888888'}
              />
              <Text style={[styles.tabText, activeTab === 'wealth' && styles.tabTextActive]}>
                Net Worth
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'health' && styles.tabBtnActive]}
              onPress={() => setActiveTab('health')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="heart-outline"
                size={15}
                color={activeTab === 'health' ? '#000000' : '#888888'}
              />
              <Text style={[styles.tabText, activeTab === 'health' && styles.tabTextActive]}>
                Health Score
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Loading global rankings...</Text>
            </View>
          ) : errorMsg ? (
            <View style={styles.centerContainer}>
              <Ionicons name="cloud-offline-outline" size={40} color="#666666" />
              <Text style={styles.errorText}>{errorMsg}</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => fetchRankings(activeTab)}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={16} color="#000000" />
                <Text style={styles.retryBtnText}>Retry Connection</Text>
              </TouchableOpacity>
            </View>
          ) : entries.length === 0 ? (
            <View style={styles.centerContainer}>
              <Ionicons name="people-outline" size={40} color="#555555" />
              <Text style={styles.emptyTitle}>No Rankings Yet</Text>
              <Text style={styles.emptySubtext}>
                Be the first player to sync a simulation save to claim Rank #1!
              </Text>
            </View>
          ) : (
            <FlatList
              data={entries}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Current Player Standing Banner */}
          <View style={styles.footerStanding}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerLabel}>YOUR PROFILE</Text>
              <Text style={styles.footerName} numberOfLines={1}>
                {profile.name} · {profile.career}
              </Text>
            </View>
            <View style={styles.footerRight}>
              <Text style={styles.footerVal}>
                {activeTab === 'wealth'
                  ? formatINR(balanceSheet.netWorth, true)
                  : `${health.totalScore}/100`}
              </Text>
              <Text style={styles.footerValSub}>
                {activeTab === 'wealth' ? `Health: ${health.totalScore}` : `Net: ${formatINR(balanceSheet.netWorth, true)}`}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0D0D0D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#222222',
    height: '90%',
    display: 'flex',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: '#1A1A1A',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trophyIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#777777',
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2E2E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222222',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    gap: 6,
    borderRadius: 11,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888888',
  },
  tabTextActive: {
    color: '#000000',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  currentRow: {
    borderColor: '#FFFFFF',
    backgroundColor: '#1A1A1A',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankBadge1: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  rankBadge2: {
    backgroundColor: '#C0C0C0',
    borderColor: '#C0C0C0',
  },
  rankBadge3: {
    backgroundColor: '#9E9E9E',
    borderColor: '#9E9E9E',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#AAAAAA',
  },
  rankTextTop: {
    color: '#000000',
    fontWeight: '900',
  },
  playerInfo: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  playerNameHighlight: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  youTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  youTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000000',
  },
  characterMeta: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '500',
    marginTop: 2,
  },
  metricWrap: {
    alignItems: 'flex-end',
  },
  primaryMetricText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  metricSubtext: {
    fontSize: 10,
    color: '#777777',
    fontWeight: '600',
    marginTop: 2,
  },
  healthMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gradeBadge: {
    backgroundColor: '#222222',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  gradeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    gap: 12,
  },
  loadingText: {
    color: '#888888',
    fontSize: 13,
    fontWeight: '600',
  },
  errorText: {
    color: '#AAAAAA',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  retryBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 6,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 16,
  },
  footerStanding: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141414',
    borderTopWidth: 1,
    borderColor: '#242424',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  footerLeft: {
    flex: 1,
    marginRight: 12,
  },
  footerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#888888',
    letterSpacing: 1,
  },
  footerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  footerVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  footerValSub: {
    fontSize: 10,
    color: '#777777',
    fontWeight: '600',
    marginTop: 1,
  },
});
