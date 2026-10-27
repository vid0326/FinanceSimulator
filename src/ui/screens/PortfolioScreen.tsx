/**
 * Portfolio Management Screen — Simplistic Minimalist UI
 * Clean holdings breakdown and asset allocation.
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
import { useSimulationStore } from '../../store/useSimulationStore';
import { InvestmentEngine } from '../../core/investment/InvestmentEngine';
import { CurrencyText, formatINR } from '../components/CurrencyText';
import { AssetAllocationChart } from '../components/AssetAllocationChart';
import { AssetItem } from '../../core/types/finance';
import { colors } from '../theme/colors';

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Minimal Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Portfolio</Text>
          <View style={styles.marketBadge}>
            <Text style={styles.marketBadgeText}>Market: {currentMarket.toUpperCase()}</Text>
          </View>
        </View>

        {/* Hero Portfolio Totals */}
        <View style={styles.heroBox}>
          <Text style={styles.heroLabel}>TOTAL INVESTMENTS</Text>
          <CurrencyText amount={balanceSheet.investmentsTotal} style={styles.heroAmount} />
          <Text style={styles.heroSIPText}>
            Active Monthly SIP: {formatINR(totalMonthlySIP)}/mo
          </Text>
        </View>

        {/* Visual Asset Allocation Donut Ring Chart */}
        <AssetAllocationChart balanceSheet={balanceSheet} />

        {/* Diversification Bar — Minimal Grayscale */}
        <View style={styles.diversificationCard}>
          <View style={styles.divRow}>
            <Text style={styles.divTitle}>Diversification Score</Text>
            <Text style={styles.divScore}>{diversification.score} / 15 pts</Text>
          </View>

          {/* Clean Segment Bar */}
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
          <Text style={styles.divFeedback}>{diversification.feedback}</Text>
        </View>

        {/* Holdings List (Clean Minimal Rows) */}
        <View style={styles.holdingsSection}>
          <Text style={styles.sectionHeader}>HOLDINGS ({balanceSheet.assets.length})</Text>
          <View style={styles.holdingsCard}>
            {balanceSheet.assets.map((asset, idx) => {
              const isEditing = editingAssetId === asset.id;
              const gainLoss = asset.currentValue - asset.investedAmount;
              const isPositive = gainLoss >= 0;
              const isLast = idx === balanceSheet.assets.length - 1;

              return (
                <View key={asset.id} style={[styles.assetRow, isLast && styles.assetRowLast]}>
                  <View style={styles.assetTop}>
                    <View style={styles.assetNameCol}>
                      <Text style={styles.assetName}>{asset.name}</Text>
                      <Text style={styles.assetMeta}>
                        {asset.category.replace('_', ' ').toUpperCase()} · Expected {(asset.expectedAnnualReturnRate * 100).toFixed(0)}% p.a.
                      </Text>
                    </View>

                    <View style={styles.assetValCol}>
                      <CurrencyText amount={asset.currentValue} style={styles.assetValText} />
                      <Text style={styles.gainLossText}>
                        {isPositive ? '+' : ''}{formatINR(gainLoss, true)}
                      </Text>
                    </View>
                  </View>

                  {/* Clean SIP Line */}
                  <View style={styles.sipRow}>
                    <Text style={styles.sipLabel}>
                      Monthly SIP: <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>{formatINR(asset.monthlySIPAmount || 0)}</Text>
                    </Text>

                    {isEditing ? (
                      <View style={styles.editControls}>
                        <TextInput
                          style={styles.sipInput}
                          keyboardType="numeric"
                          value={tempSIP}
                          onChangeText={setTempSIP}
                          placeholder="₹"
                          placeholderTextColor="#666666"
                        />
                        <TouchableOpacity style={styles.saveSIPBtn} onPress={() => handleSaveSIP(asset.id)}>
                          <Text style={styles.saveSIPText}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity onPress={() => handleStartEdit(asset)}>
                        <Text style={styles.editLink}>Edit SIP</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  marketBadge: {
    backgroundColor: '#141414',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#262626',
  },
  marketBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A3A3A3',
  },
  heroBox: {
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#888888',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  heroSIPText: {
    fontSize: 13,
    color: '#A3A3A3',
    fontWeight: '600',
    marginTop: 4,
  },
  diversificationCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 20,
  },
  divRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  divTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E5E5E5',
  },
  divScore: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  distBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E1E1E',
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 10,
  },
  distSegment: {
    height: '100%',
  },
  divFeedback: {
    fontSize: 12,
    color: '#888888',
    lineHeight: 16,
  },
  holdingsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 1,
    marginBottom: 8,
  },
  holdingsCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  assetRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#1C1C1C',
  },
  assetRowLast: {
    borderBottomWidth: 0,
  },
  assetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  assetNameCol: {
    flex: 1,
    marginRight: 10,
  },
  assetName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  assetMeta: {
    fontSize: 11,
    color: '#666666',
    marginTop: 2,
    fontWeight: '600',
  },
  assetValCol: {
    alignItems: 'flex-end',
  },
  assetValText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  gainLossText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A3A3A3',
    marginTop: 1,
  },
  sipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#181818',
  },
  sipLabel: {
    fontSize: 12,
    color: '#888888',
  },
  editLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sipInput: {
    backgroundColor: '#1A1A1A',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    width: 65,
    borderWidth: 1,
    borderColor: '#333333',
  },
  saveSIPBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saveSIPText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
  },
});
