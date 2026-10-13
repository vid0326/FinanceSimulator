/**
 * What-If Sandbox Comparison Chart — Minimalist SVG Visualizer
 * Dual curves (Current vs What-If) with clean typography.
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { ProjectionDataPoint } from '../../core/types/whatif';
import { formatINR } from './CurrencyText';

interface WhatIfChartProps {
  dataPoints: ProjectionDataPoint[];
  height?: number;
}

export const WhatIfChart: React.FC<WhatIfChartProps> = ({ dataPoints, height = 180 }) => {
  const screenWidth = Dimensions.get('window').width - 40; // Card width

  if (!dataPoints || dataPoints.length === 0) {
    return (
      <View style={[styles.container, { height, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.emptyText}>No projection data</Text>
      </View>
    );
  }

  const maxBaseline = Math.max(...dataPoints.map((p) => p.baselineNetWorth));
  const maxWhatIf = Math.max(...dataPoints.map((p) => p.whatIfNetWorth));
  const minVal = Math.min(0, ...dataPoints.map((p) => Math.min(p.baselineNetWorth, p.whatIfNetWorth)));
  const maxVal = Math.max(10000, maxBaseline, maxWhatIf);
  const range = maxVal - minVal || 1;

  const paddingLeft = 10;
  const paddingRight = 10;
  const paddingTop = 16;
  const paddingBottom = 20;

  const chartWidth = screenWidth - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (idx: number) => paddingLeft + (idx / (dataPoints.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;

  let baselinePath = `M ${getX(0)} ${getY(dataPoints[0].baselineNetWorth)}`;
  let whatIfPath = `M ${getX(0)} ${getY(dataPoints[0].whatIfNetWorth)}`;

  for (let i = 1; i < dataPoints.length; i++) {
    baselinePath += ` L ${getX(i)} ${getY(dataPoints[i].baselineNetWorth)}`;
    whatIfPath += ` L ${getX(i)} ${getY(dataPoints[i].whatIfNetWorth)}`;
  }

  const lastPoint = dataPoints[dataPoints.length - 1];

  return (
    <View style={styles.container}>
      {/* Legend & End values */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#555555' }]} />
          <Text style={styles.legendText}>Current: {formatINR(lastPoint.baselineNetWorth, true)}</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FFFFFF' }]} />
          <Text style={[styles.legendText, { color: '#FFFFFF' }]}>
            What-If: {formatINR(lastPoint.whatIfNetWorth, true)}
          </Text>
        </View>
      </View>

      {/* SVG Plot */}
      <Svg width={screenWidth} height={height}>
        {/* Zero guide line if negative */}
        {minVal < 0 && (
          <Line
            x1={paddingLeft}
            y1={getY(0)}
            x2={screenWidth - paddingRight}
            y2={getY(0)}
            stroke="#262626"
            strokeDasharray="4 4"
          />
        )}

        {/* Baseline Muted Curve */}
        <Path d={baselinePath} stroke="#555555" strokeWidth="2" fill="none" />

        {/* What-If Highlight Curve */}
        <Path d={whatIfPath} stroke="#FFFFFF" strokeWidth="2.5" fill="none" />

        {/* End dots */}
        <Circle
          cx={getX(dataPoints.length - 1)}
          cy={getY(lastPoint.baselineNetWorth)}
          r="4"
          fill="#555555"
        />
        <Circle
          cx={getX(dataPoints.length - 1)}
          cy={getY(lastPoint.whatIfNetWorth)}
          r="4"
          fill="#FFFFFF"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111111',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
    marginVertical: 10,
  },
  emptyText: {
    color: '#888888',
    fontSize: 13,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888888',
  },
});
