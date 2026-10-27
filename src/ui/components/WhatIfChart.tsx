/**
 * What-If Sandbox Comparison Chart — High-End Minimalist SVG Visualizer
 * Dual smooth Bezier curves (Current vs What-If) with shaded comparison delta and age markers.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ProjectionDataPoint } from '../../core/types/whatif';
import { formatINR } from './CurrencyText';
import { colors } from '../theme/colors';

interface WhatIfChartProps {
  dataPoints: ProjectionDataPoint[];
  height?: number;
}

export const WhatIfChart: React.FC<WhatIfChartProps> = ({ dataPoints, height = 200 }) => {
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

  const paddingLeft = 14;
  const paddingRight = 14;
  const paddingTop = 20;
  const paddingBottom = 26;

  const chartWidth = screenWidth - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (idx: number) => paddingLeft + (idx / (dataPoints.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;

  // Smooth Bezier path generator
  const createSmoothPath = (extractor: (p: ProjectionDataPoint) => number) => {
    const pts = dataPoints.map((p, i) => ({ x: getX(i), y: getY(extractor(p)) }));
    if (pts.length <= 1) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const baselinePath = useMemo(() => createSmoothPath((p) => p.baselineNetWorth), [dataPoints]);
  const whatIfPath = useMemo(() => createSmoothPath((p) => p.whatIfNetWorth), [dataPoints]);

  const lastPoint = dataPoints[dataPoints.length - 1];
  const firstPoint = dataPoints[0];
  const delta = lastPoint.whatIfNetWorth - lastPoint.baselineNetWorth;

  return (
    <View style={styles.container}>
      {/* Legend & End values */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#52525B' }]} />
          <Text style={styles.legendText}>Current: {formatINR(lastPoint.baselineNetWorth, true)}</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FFFFFF' }]} />
          <Text style={[styles.legendText, { color: '#FFFFFF', fontWeight: '800' }]}>
            What-If: {formatINR(lastPoint.whatIfNetWorth, true)}
          </Text>
        </View>

        <View style={[styles.deltaBadge, delta >= 0 ? styles.deltaBadgePos : styles.deltaBadgeNeg]}>
          <Text style={[styles.deltaText, delta >= 0 ? styles.deltaTextPos : styles.deltaTextNeg]}>
            {delta >= 0 ? '+' : ''}{formatINR(delta, true)}
          </Text>
        </View>
      </View>

      {/* SVG Canvas */}
      <Svg width={screenWidth} height={height}>
        <Defs>
          <LinearGradient id="whatIfGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.14" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.00" />
          </LinearGradient>
        </Defs>

        {/* Zero guide line if negative */}
        {minVal < 0 && (
          <Line
            x1={paddingLeft}
            y1={getY(0)}
            x2={screenWidth - paddingRight}
            y2={getY(0)}
            stroke="#222222"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
        )}

        {/* Subtle Horizontal Mid-Grid Line */}
        <Line
          x1={paddingLeft}
          y1={paddingTop + chartHeight * 0.5}
          x2={screenWidth - paddingRight}
          y2={paddingTop + chartHeight * 0.5}
          stroke="#191919"
          strokeDasharray="3 3"
          strokeWidth="1"
        />

        {/* Baseline Muted Curve */}
        <Path
          d={baselinePath}
          stroke="#52525B"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* What-If Highlight Curve */}
        <Path
          d={whatIfPath}
          stroke="#FFFFFF"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* End dots - Baseline */}
        <Circle
          cx={getX(dataPoints.length - 1)}
          cy={getY(lastPoint.baselineNetWorth)}
          r="4"
          fill="#52525B"
        />

        {/* End dots - WhatIf Pulsed */}
        <Circle
          cx={getX(dataPoints.length - 1)}
          cy={getY(lastPoint.whatIfNetWorth)}
          r="6"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeOpacity="0.4"
        />
        <Circle
          cx={getX(dataPoints.length - 1)}
          cy={getY(lastPoint.whatIfNetWorth)}
          r="3.5"
          fill="#FFFFFF"
        />
      </Svg>

      {/* Axis Footer */}
      <View style={styles.axisFooter}>
        <Text style={styles.axisLabel}>Age {firstPoint.age}</Text>
        <Text style={styles.axisLabel}>Age {Math.round((firstPoint.age + lastPoint.age) / 2)}</Text>
        <Text style={styles.axisLabel}>Age {lastPoint.age}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingTop: 14,
    paddingBottom: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  deltaBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  deltaBadgePos: {
    backgroundColor: colors.positiveBg,
    borderWidth: 1,
    borderColor: colors.positiveBorder,
  },
  deltaBadgeNeg: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  deltaText: {
    fontSize: 10,
    fontWeight: '800',
  },
  deltaTextPos: {
    color: colors.positiveLight,
  },
  deltaTextNeg: {
    color: colors.dangerLight,
  },
  axisFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderColor: '#161616',
  },
  axisLabel: {
    fontSize: 10,
    color: colors.textSubtle,
    fontWeight: '600',
  },
});
