/**
 * AssetAllocationChart — Minimalist SVG Donut & Allocation Visualizer
 * Visual ring chart depicting portfolio distribution across liquid cash, emergency fund, and asset holdings.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { BalanceSheet } from '../../core/types/finance';
import { formatINR } from './CurrencyText';
import { colors } from '../theme/colors';

interface AssetAllocationChartProps {
  balanceSheet: BalanceSheet;
  size?: number;
}

interface SliceData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

export const AssetAllocationChart: React.FC<AssetAllocationChartProps> = ({
  balanceSheet,
  size = 140,
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Aggregate assets by type
  const rawSlices: { label: string; value: number; color: string }[] = [
    { label: 'Liquid Cash', value: balanceSheet.liquidCash, color: '#FFFFFF' },
    { label: 'Emergency Vault', value: balanceSheet.emergencyFund, color: '#38BDF8' },
  ];

  balanceSheet.assets.forEach((asset, idx) => {
    const assetColors = ['#10B981', '#F59E0B', '#A78BFA', '#F43F5E', '#D4D4D8'];
    rawSlices.push({
      label: asset.name,
      value: asset.currentValue,
      color: assetColors[idx % assetColors.length],
    });
  });

  const totalAssets = rawSlices.reduce((sum, s) => sum + s.value, 0);

  const slices: SliceData[] = rawSlices
    .filter((s) => s.value > 0)
    .map((s) => ({
      ...s,
      percentage: totalAssets > 0 ? (s.value / totalAssets) * 100 : 0,
    }));

  let accumulatedPercent = 0;

  return (
    <View style={styles.card}>
      <View style={styles.chartRow}>
        {/* SVG Donut */}
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={size} height={size}>
            <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
              {/* Background Track */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#1A1A1A"
                strokeWidth={strokeWidth}
                fill="none"
              />

              {/* Slices */}
              {totalAssets > 0 &&
                slices.map((slice, i) => {
                  const strokeDashoffset = circumference - (slice.percentage / 100) * circumference;
                  const rotation = accumulatedPercent * 3.6; // 360 deg * %
                  accumulatedPercent += slice.percentage;

                  return (
                    <G key={i} rotation={rotation} origin={`${size / 2}, ${size / 2}`}>
                      <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={slice.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="none"
                      />
                    </G>
                  );
                })}
            </G>
          </Svg>

          {/* Center Cutout Text */}
          <View style={styles.centerTextContainer}>
            <Text style={styles.centerLabel}>ASSETS</Text>
            <Text style={styles.centerVal} numberOfLines={1}>
              {formatINR(totalAssets, true)}
            </Text>
          </View>
        </View>

        {/* Legend Grid */}
        <View style={styles.legendContainer}>
          {slices.length === 0 ? (
            <Text style={styles.emptyText}>No assets allocated yet.</Text>
          ) : (
            slices.map((slice, idx) => (
              <View key={idx} style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: slice.color }]} />
                <View style={styles.legendTextWrap}>
                  <Text style={styles.legendLabel} numberOfLines={1}>
                    {slice.label}
                  </Text>
                  <Text style={styles.legendAmount}>
                    {formatINR(slice.value, true)} ({slice.percentage.toFixed(0)}%)
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    marginBottom: 18,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  centerVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  legendContainer: {
    flex: 1,
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendTextWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E5E5E5',
    flex: 1,
    marginRight: 4,
  },
  legendAmount: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
