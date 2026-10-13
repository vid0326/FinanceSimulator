/**
 * SwipeDilemmaCard — Clean, Minimalist Decision Card
 * Tactile swipe physics with zero visual clutter.
 */

import React, { useRef } from 'react';
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
import { LifeScenarioEvent, DecisionOption } from '../../core/types/events';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.28 * SCREEN_WIDTH;

interface SwipeDilemmaCardProps {
  event: LifeScenarioEvent;
  onSelectOption: (option: DecisionOption) => void;
}

export const SwipeDilemmaCard: React.FC<SwipeDilemmaCardProps> = ({ event, onSelectOption }) => {
  const pan = useRef(new Animated.ValueXY()).current;

  // Option Right (A / primary) and Option Left (B / alternative)
  const optionRight = event.options[0];
  const optionLeft = event.options[1] || event.options[0];

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
          triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
          Animated.timing(pan, {
            toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
            duration: 220,
            useNativeDriver: false,
          }).start(() => {
            onSelectOption(optionRight);
            pan.setValue({ x: 0, y: 0 });
          });
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
          Animated.timing(pan, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy },
            duration: 220,
            useNativeDriver: false,
          }).start(() => {
            onSelectOption(optionLeft);
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
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

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

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
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      onSelectOption(option);
      pan.setValue({ x: 0, y: 0 });
    });
  };

  return (
    <View style={styles.container}>
      {/* Animated Clean Decision Card */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }],
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.categoryText}>{event.category.toUpperCase()}</Text>
          <Ionicons name={event.icon as any} size={20} color="#FFFFFF" />
        </View>

        <View style={styles.contentArea}>
          <Text style={styles.cardTitle}>{event.title}</Text>
          <Text style={styles.cardStory}>{event.storyDescription}</Text>
        </View>

        {/* Swipe Hint Footer */}
        <View style={styles.swipeHintRow}>
          <Text style={styles.swipeHintText}>← Swipe left or right to choose →</Text>
        </View>

        {/* Stamp Overlays */}
        <Animated.View style={[styles.stamp, styles.rightStamp, { opacity: rightStampOpacity }]}>
          <Text style={styles.rightStampText}>CHOOSE RIGHT</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.leftStamp, { opacity: leftStampOpacity }]}>
          <Text style={styles.leftStampText}>CHOOSE LEFT</Text>
        </Animated.View>
      </Animated.View>

      {/* Direct Tap Choice Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.choiceBtnLeft}
          onPress={() => handleManualSelect(optionLeft, false)}
        >
          <Text style={styles.btnSubLabel}>OPTION B</Text>
          <Text style={styles.btnMainLabelLeft} numberOfLines={2}>
            {optionLeft.title}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.choiceBtnRight}
          onPress={() => handleManualSelect(optionRight, true)}
        >
          <Text style={styles.btnSubLabelRight}>OPTION A</Text>
          <Text style={styles.btnMainLabelRight} numberOfLines={2}>
            {optionRight.title}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 4,
  },
  card: {
    width: SCREEN_WIDTH - 40,
    minHeight: 280,
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#262626',
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#888888',
    letterSpacing: 1,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  cardStory: {
    fontSize: 14,
    color: '#A3A3A3',
    lineHeight: 20,
    fontWeight: '500',
  },
  swipeHintRow: {
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: '#1C1C1C',
  },
  swipeHintText: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '600',
  },
  stamp: {
    position: 'absolute',
    top: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
  },
  rightStamp: {
    right: 20,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '8deg' }],
  },
  rightStampText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  leftStamp: {
    left: 20,
    borderColor: '#FFFFFF',
    backgroundColor: '#1A1A1A',
    transform: [{ rotate: '-8deg' }],
  },
  leftStampText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: SCREEN_WIDTH - 40,
  },
  choiceBtnLeft: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    justifyContent: 'center',
  },
  btnSubLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  btnMainLabelLeft: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  choiceBtnRight: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    justifyContent: 'center',
  },
  btnSubLabelRight: {
    fontSize: 10,
    fontWeight: '800',
    color: '#555555',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  btnMainLabelRight: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
    lineHeight: 18,
  },
});
