/**
 * Portfolio Management Screen
 * Asset allocation, market cycle conditions, HHI diversification score, and SIP management.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useSimulationStore } from '../../store/useSimulationStore';
import { InvestmentEngine } from '../../core/investment/InvestmentEngine';
import { CurrencyText, formatINR } from '../components/CurrencyText';
import { AssetItem, AssetType } from '../../core/types/finance';

export const PortfolioScreen: React.FC = () => {
  const balanceSheet = useSimulationStore((state) => state.balanceSheet);
  const currentMarket = useSimulationStore((state) => state.currentMarket);
  const updateAssetSIP = useSimulationStore((state) => state.updateAssetSIP);

  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [tempSIP, setTempSIP] = useState<string>('');

  const diversification = InvestmentEngine.calculateDiversificationScore(balanceSheet.assets);
  const totalMonthlySIP = balanceSheet.assets.reduce((sum, a) => sum + (a.monthlySIPAmount || 0), 0);

  const handleStartEdit = (asset: AssetItem) => {
    setEditingAssetId(asset.id);
    setTempSIP((asset.monthlySIPAmount || 0).toString());
  };

  const handleSaveSIP = (assetId: string) => {
    const val = parseInt(tempSIP, 10);
    if (!isNaN(val)) {
      updateAssetSIP(assetId, Math.max(0, val));
    }
    setEditingAssetId(null);
  };

  let marketTagColor = colors.primary;
  let marketDescription = 'Market is trending upward with healthy growth.';
  if (currentMarket === 'bear') {
    marketTagColor = colors.dangerLight;
    marketDescription = 'Bear market phase: Stock prices are declining, offering discounted SIP accumulation.';
  } else if (currentMarket === 'crash') {
    marketTagColor = colors.danger;
    marketDescription = 'Market Crash: Deep temporary drawdown. Tests emotional investing discipline!';
  } else if (currentMarket === 'recovery') {
    marketTagColor = colors.primaryLight;
    marketDescription = 'Recovery rally: Asset valuations bouncing back following market lows.';
  } else if (currentMarket === 'stagnant') {
    marketTagColor = colors.textSecondary;
    marketDescription = 'Sideways market: Asset valuations moving in a narrow range.';
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Virtual Portfolio</Text>
          <Text style={styles.subtitle}>
            Practice multi-asset diversification without capital risk.
          </Text>
        </View>

        {/* Portfolio Overview Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroLabel}>Total Portfolio Value</Text>
              <CurrencyText amount={balanceSheet.investmentsTotal} style={styles.heroValue} />
            </View>
            <View style={styles.sipTotalBox}>
              <Text style={styles.sipTotalLabel}>Active Monthly SIP</Text>
              <Text style={styles.sipTotalValue}>{formatINR(totalMonthlySIP)}/mo</Text>
            </View>
          </View>

          {/* Market Cycle Indicator */}
          <View style={styles.marketBanner}>
            <View style={styles.marketHeader}>
              <View style={[styles.marketDot, { backgroundColor: marketTagColor }]} />
              <Text style={[styles.marketTitle, { color: marketTagColor }]}>
                Market Environment: {currentMarket.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.marketDesc}>{marketDescription}</Text>
          </View>
        </View>

        {/* Diversification Assessment Card */}
        <View style={styles.diversificationCard}>
          <View style={styles.diversificationHeader}>
            <View style={styles.divTitleRow}>
              <Ionicons name="pie-chart" size={18} color={colors.accent} />
              <Text style={styles.divTitle}>Portfolio Diversification</Text>
            </View>
            <View style={styles.divScoreBadge}>
              <Text style={styles.divScoreText}>{diversification.score}/15 Pts</Text>
            </View>
          </View>
          <Text style={styles.divFeedback}>{diversification.feedback}</Text>

          {/* Asset Distribution Bar */}
          <View style={styles.distBar}>
            {balanceSheet.assets.map((asset, idx) => {
              const weight = balanceSheet.investmentsTotal > 0
                ? (asset.currentValue / balanceSheet.investmentsTotal) * 100
                : 0;
              if (weight <= 0) return null;
              const barColors = ['#FFFFFF', '#D1D5DB', '#9CA3AF', '#4B5563'];
              const barColor = barColors[idx % barColors.length];
              return (
                <View
                  key={asset.id}
                  style={[styles.distSegment, { width: `${weight}%`, backgroundColor: barColor }]}
                />
              );
            })}
          </View>
        </View>

        {/* Asset List */}
        <Text style={styles.sectionTitle}>Your Holdings ({balanceSheet.assets.length})</Text>

        {balanceSheet.assets.map((asset) => {
          const isEditing = editingAssetId === asset.id;
          const gainLoss = asset.currentValue - asset.investedAmount;
          const isPositive = gainLoss >= 0;

          return (
            <View key={asset.id} style={styles.assetCard}>
              <View style={styles.assetTopRow}>
                <View style={styles.assetNameCol}>
                  <Text style={styles.assetName}>{asset.name}</Text>
                  <Text style={styles.assetCategory}>
                    {asset.category.replace('_', ' ').toUpperCase()} • Expected ~{(asset.expectedAnnualReturnRate * 100).toFixed(1)}% p.a.
                  </Text>
                </View>
                <View style={styles.assetValCol}>
                  <CurrencyText amount={asset.currentValue} style={styles.assetValText} />
                  <Text style={[styles.gainLossText, { color: isPositive ? colors.primaryLight : colors.dangerLight }]}>
                    {isPositive ? '+' : ''}{formatINR(gainLoss, true)}
                  </Text>
                </View>
              </View>

              {/* SIP Setting */}
              <View style={styles.sipRow}>
                <View style={styles.sipInfo}>
                  <Ionicons name="repeat" size={14} color={colors.textSecondary} />
                  <Text style={styles.sipText}>
                    Monthly SIP: <Text style={{ color: colors.text, fontWeight: '700' }}>{formatINR(asset.monthlySIPAmount || 0)}</Text>
                  </Text>
                </View>

                {isEditing ? (
                  <View style={styles.editControls}>
                    <TextInput
                      style={styles.sipInput}
                      keyboardType="numeric"
                      value={tempSIP}
                      onChangeText={setTempSIP}
                      placeholder="₹ amount"
                      placeholderTextColor={colors.textMuted}
                    />
                    <TouchableOpacity style={styles.saveSIPBtn} onPress={() => handleSaveSIP(asset.id)}>
                      <Text style={styles.saveSIPText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.editSIPBtn} onPress={() => handleStartEdit(asset)}>
                    <Text style={styles.editSIPText}>Edit SIP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 0,
  },
  container: {
    padding: 16,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 16,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  heroValue: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },
  sipTotalBox: {
    alignItems: 'flex-end',
  },
  sipTotalLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  sipTotalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  marketBanner: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
  },
  marketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  marketDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  marketTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  marketDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  diversificationCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 16,
  },
  diversificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  divTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  divTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  divScoreBadge: {
    backgroundColor: colors.accentGlow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  divScoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accent,
  },
  divFeedback: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 12,
  },
  distBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceElevated,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  distSegment: {
    height: '100%',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  assetCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 10,
  },
  assetTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  assetNameCol: {
    flex: 1,
  },
  assetName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  assetCategory: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  assetValCol: {
    alignItems: 'flex-end',
  },
  assetValText: {
    fontSize: 16,
    fontWeight: '800',
  },
  gainLossText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  sipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingTop: 10,
  },
  sipInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  editControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sipInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    width: 80,
  },
  saveSIPBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveSIPText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  editSIPBtn: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  editSIPText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
});
