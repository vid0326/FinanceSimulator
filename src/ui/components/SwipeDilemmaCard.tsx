/**
 * SwipeDilemmaCard — "Reigns / Tinder" Style Tactile Decision Card
 * Built with PanResponder and Animated for fluid 60fps tilt and swipe physics in Expo Go.
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { LifeScenarioEvent, DecisionOption } from '../../core/types/events';
import { formatINR } from './CurrencyText';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.28 * SCREEN_WIDTH;

interface SwipeDilemmaCardProps {
  event: LifeScenarioEvent;
  onSelectOption: (option: DecisionOption) => void;
}

export const SwipeDilemmaCard: React.FC<SwipeDilemmaCardProps> = ({ event, onSelectOption }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [optionIndex, setOptionIndex] = useState(0);

  // Pick left option (Option B or 0) and right option (Option A or 1)
  const optionLeft = event.options[1] || event.options[0];
  const optionRight = event.options[0];

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
    try {
      Haptics.impactAsync(style);
    } catch {
      // Fallback
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        pan.setValue({ x: gestureState.dx, y: gestureState.dy * 0.3 });
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swipe Right -> Option Right
          triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
          Animated.timing(pan, {
            toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
            duration: 250,
            useNativeDriver: false,
          }).start(() => {
            onSelectOption(optionRight);
            pan.setValue({ x: 0, y: 0 });
          });
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swipe Left -> Option Left
          triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
          Animated.timing(pan, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy },
            duration: 250,
            useNativeDriver: false,
          }).start(() => {
            onSelectOption(optionLeft);
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          // Reset to center
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            tension: 40,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // Rotation based on X displacement
  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  // Stamp opacities
  const rightStampOpacity = pan.x.interpolate({
    inputRange: [20, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const leftStampOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -20],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const handleManualSelect = (option: DecisionOption, toRight: boolean) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.timing(pan, {
      toValue: { x: toRight ? SCREEN_WIDTH + 80 : -SCREEN_WIDTH - 80, y: 0 },
      duration: 240,
      useNativeDriver: false,
    }).start(() => {
      onSelectOption(option);
      pan.setValue({ x: 0, y: 0 });
    });
  };

  return (
    <View style={styles.container}>
      {/* Swipeable Card Stack Container */}
      <View style={styles.cardArea}>
        {/* Decorative Background Card Shadow */}
        <View style={styles.backCardShadow} />

        {/* Interactive Active Card */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.card,
            {
              transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }],
            },
          ]}
        >
          {/* Header Banner */}
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name={event.icon as any} size={22} color="#FFFFFF" />
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category.toUpperCase()}</Text>
            </View>
          </View>

          {/* Title & Narrative */}
          <Text style={styles.cardTitle}>{event.title}</Text>
          <Text style={styles.cardHeadline}>"{event.headline}"</Text>
          <Text style={styles.cardStory} numberOfLines={3}>
            {event.storyDescription}
          </Text>

          {/* Dynamic Action Preview Hints */}
          <View style={styles.previewBox}>
            <View style={styles.previewRow}>
              <Ionicons name="arrow-back" size={14} color="#A3A3A3" />
              <Text style={styles.previewTextLeft}>
                SWIPE LEFT: <Text style={styles.highlightText}>{optionLeft.title}</Text>
              </Text>
            </View>
            <View style={[styles.previewRow, { marginTop: 6 }]}>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
              <Text style={styles.previewTextRight}>
                SWIPE RIGHT: <Text style={styles.highlightText}>{optionRight.title}</Text>
              </Text>
            </View>
          </View>

          {/* Stamp Overlay: Right (Accept / Option A) */}
          <Animated.View style={[styles.stampBox, styles.rightStamp, { opacity: rightStampOpacity }]}>
            <Text style={styles.rightStampText}>CHOOSE RIGHT</Text>
            <Text style={styles.rightStampSubText}>{optionRight.title}</Text>
          </Animated.View>

          {/* Stamp Overlay: Left (Decline / Option B) */}
          <Animated.View style={[styles.stampBox, styles.leftStamp, { opacity: leftStampOpacity }]}>
            <Text style={styles.leftStampText}>CHOOSE LEFT</Text>
            <Text style={styles.leftStampSubText}>{optionLeft.title}</Text>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Tactile Big Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.actionBtn, styles.leftBtn]}
          onPress={() => handleManualSelect(optionLeft, false)}
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
          <Text style={styles.btnLabel} numberOfLines={1}>{optionLeft.title}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.actionBtn, styles.rightBtn]}
          onPress={() => handleManualSelect(optionRight, true)}
        >
          <Ionicons name="checkmark" size={24} color="#000000" />
          <Text style={[styles.btnLabel, { color: '#000000' }]} numberOfLines={1}>
            {optionRight.title}
          </Text>
        </TouchableOpacity>
      </View>

      {/* If 3rd option exists, show quick-select pill */}
      {event.options.length > 2 && (
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.thirdOptionPill}
          onPress={() => onSelectOption(event.options[2])}
        >
          <Text style={styles.thirdOptionText}>
            Alternative: <Text style={{ fontWeight: '800' }}>{event.options[2].title}</Text> →
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  cardArea: {
    width: SCREEN_WIDTH - 32,
    height: 380,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backCardShadow: {
    position: 'absolute',
    width: SCREEN_WIDTH - 48,
    height: 350,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    top: 18,
    opacity: 0.6,
  },
  card: {
    width: SCREEN_WIDTH - 32,
    height: 360,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  categoryBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.3,
    marginTop: 6,
  },
  cardHeadline: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
    marginVertical: 4,
    fontStyle: 'italic',
  },
  cardStory: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  previewBox: {
    backgroundColor: colors.surfaceElevated,
    padding: 12,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewTextLeft: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
    flex: 1,
  },
  previewTextRight: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
    flex: 1,
  },
  highlightText: {
    color: colors.text,
    fontWeight: '700',
  },
  stampBox: {
    position: 'absolute',
    top: 40,
    borderWidth: 2.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  rightStamp: {
    right: 20,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '12deg' }],
  },
  leftStamp: {
    left: 20,
    borderColor: '#FFFFFF',
    backgroundColor: '#1E1E1E',
    transform: [{ rotate: '-12deg' }],
  },
  rightStampText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
  leftStampText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  rightStampSubText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
    marginTop: 2,
    maxWidth: 140,
    textAlign: 'center',
  },
  leftStampSubText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A3A3A3',
    marginTop: 2,
    maxWidth: 140,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 14,
    width: '100%',
    paddingHorizontal: 20,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftBtn: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorderLight,
  },
  rightBtn: {
    backgroundColor: '#FFFFFF',
  },
  btnLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  thirdOptionPill: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  thirdOptionText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
