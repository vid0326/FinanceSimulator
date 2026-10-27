/**
 * NetWorthChart — High-Performance Minimalist SVG Area Graph
 * Smooth Bezier curved area chart depicting monthly wealth accumulation over time.
 * Features time-range filtering, gradient shading, and tabular metrics.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';
import { HistoricalSnapshot } from '../../core/types/finance';
import { formatINR } from './CurrencyText';
import { colors } from '../theme/colors';

interface NetWorthChartProps {
  snapshots: HistoricalSnapshot[];
  currentNetWorth: number;
}

type TimeRange = 'all' | '12m' | '6m';

export const NetWorthChart: React.FC<NetWorthChartProps> = ({ snapshots, currentNetWorth }) => {
  const [range, setRange] = useState<TimeRange>('all');
  const screenWidth = Dimensions.get('window').width - 40; // Horizontal screen padding
  const chartHeight = 150;

  // Filter snapshots based on selected range
  const filteredData = useMemo(() => {
    if (!snapshots || snapshots.length === 0) {
      return [{ monthIndex: 0, netWorth: currentNetWorth, monthInYear: 1, age: 21 }];
    }
    if (range === '6m') {
      return snapshots.slice(-6);
    }
    if (range === '12m') {
      return snapshots.slice(-12);
    }
    return snapshots;
  }, [snapshots, range, currentNetWorth]);

  // Calculate start vs current delta
  const initialVal = filteredData[0]?.netWorth ?? currentNetWorth;
  const currentVal = filteredData[filteredData.length - 1]?.netWorth ?? currentNetWorth;
  const netChange = currentVal - initialVal;
  const percentageChange = initialVal > 0 ? (netChange / initialVal) * 100 : netChange > 0 ? 100 : 0;

  // Min / Max computations
  const values = filteredData.map((d) => d.netWorth);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const span = Math.max(1000, maxVal - minVal);

  const paddingX = 14;
  const paddingTop = 18;
  const paddingBottom = 22;

  const width = screenWidth;
  const plotWidth = width - paddingX * 2;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const getX = (idx: number) => {
    if (filteredData.length <= 1) return width / 2;
    return paddingX + (idx / (filteredData.length - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    return paddingTop + plotHeight - ((val - minVal) / span) * plotHeight;
  };

  // Generate smooth cubic Bezier path
  const { linePath, areaPath } = useMemo(() => {
    if (filteredData.length === 0) return { linePath: '', areaPath: '' };
    if (filteredData.length === 1) {
      const x = getX(0);
      const y = getY(filteredData[0].netWorth);
      return {
        linePath: `M ${x - 20} ${y} L ${x + 20} ${y}`,
        areaPath: `M ${x - 20} ${y} L ${x + 20} ${y} L ${x + 20} ${paddingTop + plotHeight} L ${x - 20} ${paddingTop + plotHeight} Z`,
      };
    }

    const points = filteredData.map((d, i) => ({ x: getX(i), y: getY(d.netWorth) }));
    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      // Catmull-Rom to Cubic Bezier conversion
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const baselineY = paddingTop + plotHeight;
    const a = `${d} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;

    return { linePath: d, areaPath: a };
  }, [filteredData, minVal, maxVal, span]);

  const lastPoint = {
    x: getX(filteredData.length - 1),
    y: getY(filteredData[filteredData.length - 1].netWorth),
  };

  return (
    <View style={styles.card}>
      {/* Chart Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>WEALTH VELOCITY</Text>
          <View style={styles.statsRow}>
            <Text style={styles.metricBig}>{formatINR(currentVal, true)}</Text>
            <View style={[styles.deltaBadge, netChange >= 0 ? styles.deltaBadgePos : styles.deltaBadgeNeg]}>
              <Text style={[styles.deltaText, netChange >= 0 ? styles.deltaTextPos : styles.deltaTextNeg]}>
                {netChange >= 0 ? '+' : ''}{formatINR(netChange, true)} ({percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%)
              </Text>
            </View>
          </View>
        </View>

        {/* Range Pill Selector */}
        <View style={styles.rangePillWrap}>
          {(['all', '12m', '6m'] as TimeRange[]).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}
              onPress={() => setRange(r)}
              activeOpacity={0.7}
            >
              <Text style={[styles.rangeBtnText, range === r && styles.rangeBtnTextActive]}>
                {r === 'all' ? 'All' : r.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* SVG Canvas */}
      <View style={styles.svgContainer}>
        <Svg width={width} height={chartHeight}>
          <Defs>
            <LinearGradient id="nwAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
              <Stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.04" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.00" />
            </LinearGradient>
          </Defs>

          {/* Dotted Grid Horizontal Guideline */}
          <Line
            x1={paddingX}
            y1={paddingTop + plotHeight * 0.5}
            x2={width - paddingX}
            y2={paddingTop + plotHeight * 0.5}
            stroke="#1C1C1C"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Shaded Area Under Curve */}
          {areaPath ? <Path d={areaPath} fill="url(#nwAreaGrad)" /> : null}

          {/* Crisp Primary Line */}
          {linePath ? (
            <Path
              d={linePath}
              stroke="#FFFFFF"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {/* Pulse Outer Ring on Latest Point */}
          <Circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r="6"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeOpacity="0.4"
          />

          {/* Latest Point Core Dot */}
          <Circle cx={lastPoint.x} cy={lastPoint.y} r="3" fill="#FFFFFF" />
        </Svg>
      </View>

      {/* Axis Footer */}
      <View style={styles.axisFooter}>
        <Text style={styles.axisLabel}>
          Month 1 · {filteredData[0]?.age ? `Age ${filteredData[0].age}` : 'Start'}
        </Text>
        <Text style={styles.axisLabel}>
          Month {snapshots.length} · Current
        </Text>
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
    paddingTop: 16,
    paddingBottom: 10,
    marginBottom: 18,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricBig: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  deltaBadge: {
    paddingHorizontal: 6,
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
  rangePillWrap: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: '#242424',
  },
  rangeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rangeBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  rangeBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#777777',
  },
  rangeBtnTextActive: {
    color: '#000000',
  },
  svgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#555555',
    fontWeight: '600',
  },
});
