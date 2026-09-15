/**
 * What-If Sandbox Comparison Chart
 * Visualizes dual projection curves (Baseline vs What-If) using react-native-svg.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme/colors';
import { ProjectionDataPoint } from '../../core/types/whatif';
import { formatINR } from './CurrencyText';

interface WhatIfChartProps {
  dataPoints: ProjectionDataPoint[];
  height?: number;
}

export const WhatIfChart: React.FC<WhatIfChartProps> = ({ dataPoints, height = 220 }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(dataPoints.length - 1);
  const screenWidth = Dimensions.get('window').width - 40; // Card padding

  if (!dataPoints || dataPoints.length === 0) {
    return (
      <View style={[styles.container, { height, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.emptyText}>No projection data</Text>
      </View>
    );
  }

  // Calculate scales
  const maxBaseline = Math.max(...dataPoints.map((p) => p.baselineNetWorth));
  const maxWhatIf = Math.max(...dataPoints.map((p) => p.whatIfNetWorth));
  const minVal = Math.min(0, ...dataPoints.map((p) => Math.min(p.baselineNetWorth, p.whatIfNetWorth)));
  const maxVal = Math.max(10000, maxBaseline, maxWhatIf);
  const range = maxVal - minVal || 1;

  const paddingLeft = 10;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = screenWidth - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (idx: number) => paddingLeft + (idx / (dataPoints.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;

  // Build SVG Path strings
  let baselinePath = `M ${getX(0)} ${getY(dataPoints[0].baselineNetWorth)}`;
  let whatIfPath = `M ${getX(0)} ${getY(dataPoints[0].whatIfNetWorth)}`;

  for (let i = 1; i < dataPoints.length; i++) {
    baselinePath += ` L ${getX(i)} ${getY(dataPoints[i].baselineNetWorth)}`;
    whatIfPath += ` L ${getX(i)} ${getY(dataPoints[i].whatIfNetWorth)}`;
  }

  const selectedPoint = dataPoints[selectedIndex] || dataPoints[dataPoints.length - 1];
  const netWorthDelta = selectedPoint.whatIfNetWorth - selectedPoint.baselineNetWorth;

  return (
    <View style={styles.container}>
      {/* Selected Scrubber Info Bar */}
      <View style={styles.infoBar}>
        <View>
          <Text style={styles.pointAgeText}>
            Month {selectedPoint.monthIndex} • Age {selectedPoint.age}
          </Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.chartBaseline }]} />
            <Text style={styles.legendText}>
              Current: {formatINR(selectedPoint.baselineNetWorth, true)}
            </Text>
            <View style={[styles.legendDot, { backgroundColor: colors.chartWhatIf, marginLeft: 12 }]} />
            <Text style={styles.legendText}>
              What-If: {formatINR(selectedPoint.whatIfNetWorth, true)}
            </Text>
          </View>
        </View>

        <View style={styles.deltaBadge}>
          <Text
            style={[
              styles.deltaText,
              { color: netWorthDelta >= 0 ? colors.primaryLight : colors.dangerLight },
            ]}
          >
            {netWorthDelta >= 0 ? '+' : ''}
            {formatINR(netWorthDelta, true)}
          </Text>
        </View>
      </View>

      {/* SVG Plot */}
      <Svg width={screenWidth} height={height}>
        <Defs>
          <LinearGradient id="baselineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={colors.chartBaseline} stopOpacity={0.2} />
            <Stop offset="100%" stopColor={colors.chartBaseline} stopOpacity={0.0} />
          </LinearGradient>
          <LinearGradient id="whatIfGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={colors.chartWhatIf} stopOpacity={0.2} />
            <Stop offset="100%" stopColor={colors.chartWhatIf} stopOpacity={0.0} />
          </LinearGradient>
        </Defs>

        {/* Zero baseline horizontal line if minVal < 0 */}
        {minVal < 0 && (
          <Line
            x1={paddingLeft}
            y1={getY(0)}
            x2={screenWidth - paddingRight}
            y2={getY(0)}
            stroke={colors.surfaceBorder}
            strokeDasharray="4 4"
          />
        )}

        {/* Baseline Path */}
        <Path d={baselinePath} stroke={colors.chartBaseline} strokeWidth="2.5" fill="none" />

        {/* What-If Path */}
        <Path d={whatIfPath} stroke={colors.chartWhatIf} strokeWidth="3" fill="none" />

        {/* Scrubber vertical guide line */}
        <Line
          x1={getX(selectedIndex)}
          y1={paddingTop}
          x2={getX(selectedIndex)}
          y2={height - paddingBottom}
          stroke="#475569"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        {/* Scrubber active dots */}
        <Circle
          cx={getX(selectedIndex)}
          cy={getY(selectedPoint.baselineNetWorth)}
          r="4.5"
          fill={colors.chartBaseline}
          stroke="#0B0F19"
          strokeWidth="2"
        />
        <Circle
          cx={getX(selectedIndex)}
          cy={getY(selectedPoint.whatIfNetWorth)}
          r="5.5"
          fill={colors.chartWhatIf}
          stroke="#0B0F19"
          strokeWidth="2"
        />
      </Svg>

      {/* Touch points scrubber buttons */}
      <View style={styles.scrubberRow}>
        {[12, 24, 36, 48, 60].map((m) => {
          if (m > dataPoints.length) return null;
          const targetIndex = m - 1;
          const isActive = selectedIndex === targetIndex;
          return (
            <TouchableOpacity
              key={m}
              style={[styles.scrubPill, isActive && styles.scrubPillActive]}
              onPress={() => setSelectedIndex(targetIndex)}
            >
              <Text style={[styles.scrubText, isActive && styles.scrubTextActive]}>
                {m / 12}Y
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginVertical: 10,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointAgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  deltaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
  },
  deltaText: {
    fontSize: 12,
    fontWeight: '800',
  },
  scrubberRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  scrubPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
  },
  scrubPillActive: {
    backgroundColor: colors.primary,
  },
  scrubText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  scrubTextActive: {
    color: '#0B0F19',
  },
});
