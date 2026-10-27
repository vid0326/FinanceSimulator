/**
 * CareerLadderGraph — Minimalist Career Ladder & Promotion Timeline Node Graph
 * Displays career tier progression, salary potential brackets, and tenure review countdown.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CareerEngine, CareerLevel } from '../../core/career/CareerEngine';
import { UserProfile } from '../../core/types/profile';
import { formatINR } from './CurrencyText';
import { colors } from '../theme/colors';

interface CareerLadderGraphProps {
  profile: UserProfile;
  currentSalary: number;
  monthsInRole: number;
}

export const CareerLadderGraph: React.FC<CareerLadderGraphProps> = ({
  profile,
  currentSalary,
  monthsInRole,
}) => {
  // Determine user's current track
  let trackKey = 'tech';
  const c = profile.career.toLowerCase();
  if (c.includes('design') || c.includes('creative') || c.includes('writer')) trackKey = 'creative';
  else if (c.includes('business') || c.includes('founder') || c.includes('sales') || c.includes('consultant'))
    trackKey = 'business';
  else if (c.includes('general') || c.includes('executive') || c.includes('analyst') || c.includes('doctor'))
    trackKey = 'general';

  const levels: CareerLevel[] = CareerEngine.CAREER_TRACKS[trackKey] || CareerEngine.CAREER_TRACKS.tech;

  // Find active level
  let currentLevelIdx = 0;
  levels.forEach((l, i) => {
    if (l.title.toLowerCase() === profile.career.toLowerCase()) {
      currentLevelIdx = i;
    }
  });

  const activeLevel = levels[currentLevelIdx] || levels[0];
  const nextLevel = levels[currentLevelIdx + 1] || null;
  const tenureNeeded = activeLevel.tenureMonthsRequired;
  const tenureProgress = Math.min(1, monthsInRole / tenureNeeded);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerLabel}>CAREER MILESTONE PIPELINE</Text>
          <Text style={styles.headerTrack}>Track: {trackKey.toUpperCase()}</Text>
        </View>
        <View style={styles.currentTierPill}>
          <Text style={styles.currentTierText}>Tier {currentLevelIdx + 1} of 4</Text>
        </View>
      </View>

      {/* Progress to Next Appraisal */}
      {nextLevel && (
        <View style={styles.progressWrap}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressLabel}>Appraisal Review Readiness</Text>
            <Text style={styles.progressVal}>
              {monthsInRole} / {tenureNeeded} mos
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${tenureProgress * 100}%` }]} />
          </View>
        </View>
      )}

      {/* Vertical Step Nodes */}
      <View style={styles.ladderList}>
        {levels.map((lvl, idx) => {
          const isCompleted = idx < currentLevelIdx;
          const isCurrent = idx === currentLevelIdx;
          const isLocked = idx > currentLevelIdx;

          return (
            <View key={lvl.levelIndex} style={styles.ladderRow}>
              {/* Node Column */}
              <View style={styles.nodeCol}>
                <View
                  style={[
                    styles.nodeCircle,
                    isCurrent && styles.nodeCurrent,
                    isCompleted && styles.nodeCompleted,
                    isLocked && styles.nodeLocked,
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={13} color="#000000" />
                  ) : isCurrent ? (
                    <View style={styles.innerPulse} />
                  ) : (
                    <Text style={styles.nodeLockedText}>{idx + 1}</Text>
                  )}
                </View>

                {/* Connecting Line */}
                {idx < levels.length - 1 && (
                  <View
                    style={[
                      styles.connectorLine,
                      isCompleted ? styles.connectorCompleted : styles.connectorLocked,
                    ]}
                  />
                )}
              </View>

              {/* Level Details */}
              <View style={[styles.levelContent, isCurrent && styles.levelContentCurrent]}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.levelTitle,
                      isCurrent && styles.levelTitleCurrent,
                      isLocked && styles.levelTitleLocked,
                    ]}
                  >
                    {lvl.title}
                  </Text>
                  <Text style={[styles.salaryBracket, isCurrent && styles.salaryBracketCurrent]}>
                    {formatINR(lvl.minMonthlySalary, true)} - {formatINR(lvl.maxMonthlySalary, true)}/mo
                  </Text>
                </View>
                <Text style={styles.levelDesc} numberOfLines={2}>
                  {lvl.description}
                </Text>
              </View>
            </View>
          );
        })}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.2,
  },
  headerTrack: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  currentTierPill: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  currentTierText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4D4D8',
  },
  progressWrap: {
    marginBottom: 16,
    backgroundColor: '#141414',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222222',
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  progressVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#262626',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  ladderList: {
    gap: 0,
  },
  ladderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  nodeCol: {
    alignItems: 'center',
    width: 28,
    marginRight: 10,
  },
  nodeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  nodeCurrent: {
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
  },
  innerPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  nodeCompleted: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  nodeLocked: {
    backgroundColor: '#141414',
    borderColor: '#2E2E2E',
  },
  nodeLockedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666666',
  },
  connectorLine: {
    width: 2,
    height: 44,
  },
  connectorCompleted: {
    backgroundColor: '#FFFFFF',
  },
  connectorLocked: {
    backgroundColor: '#222222',
  },
  levelContent: {
    flex: 1,
    paddingBottom: 16,
  },
  levelContentCurrent: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#262626',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  levelTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E5E5E5',
    flex: 1,
  },
  levelTitleCurrent: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  levelTitleLocked: {
    color: '#71717A',
  },
  salaryBracket: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  salaryBracketCurrent: {
    color: '#10B981',
  },
  levelDesc: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
    marginTop: 2,
  },
});
