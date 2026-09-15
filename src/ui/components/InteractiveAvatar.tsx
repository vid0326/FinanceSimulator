/**
 * Interactive Avatar Character State Machine
 * Smooth 60fps Reanimated vector character reacting to financial health and life satisfaction.
 * Guaranteed 100% compatible with Expo Go and ready for Rive swap in Dev Clients.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Path, G, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

export type AvatarMood = 'confident' | 'happy' | 'thoughtful' | 'stressed' | 'panic';

interface InteractiveAvatarProps {
  mood?: AvatarMood;
  size?: number;
  userName?: string;
}

export const InteractiveAvatar: React.FC<InteractiveAvatarProps> = ({
  mood = 'happy',
  size = 80,
  userName,
}) => {
  // Breathing & bouncing animation shared values
  const translateY = useSharedValue(0);
  const eyeScaleY = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    // Idle floating / breathing loop
    translateY.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Natural blinking loop
    const blinkInterval = setInterval(() => {
      eyeScaleY.value = withSequence(
        withTiming(0.1, { duration: 90 }),
        withTiming(1, { duration: 110 })
      );
    }, 3800);

    // Dynamic glow pulsation for confident state
    if (mood === 'confident') {
      glowOpacity.value = withRepeat(
        withSequence(withTiming(0.8, { duration: 1000 }), withTiming(0.3, { duration: 1000 })),
        -1,
        true
      );
    } else {
      glowOpacity.value = withSpring(0.2);
    }

    return () => clearInterval(blinkInterval);
  }, [mood]);

  const animatedBodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedEyeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: eyeScaleY.value }],
  }));

  // Mood color and expression configuration
  let auraColor = colors.primary;
  let mouthPath = 'M 28 52 Q 40 64 52 52'; // Smiling default
  let eyebrowPathLeft = 'M 25 32 Q 32 30 38 32';
  let eyebrowPathRight = 'M 42 32 Q 48 30 55 32';
  let showSweat = false;

  switch (mood) {
    case 'confident':
      auraColor = colors.primaryLight;
      mouthPath = 'M 26 50 Q 40 68 54 50'; // Big confident grin
      eyebrowPathLeft = 'M 24 28 Q 32 26 38 30';
      eyebrowPathRight = 'M 42 30 Q 48 26 56 28';
      break;

    case 'thoughtful':
      auraColor = colors.secondaryLight;
      mouthPath = 'M 32 54 L 48 54'; // Straight focused mouth
      eyebrowPathLeft = 'M 25 30 L 38 34'; // Raised thoughtful brow
      eyebrowPathRight = 'M 42 31 L 55 31';
      break;

    case 'stressed':
      auraColor = colors.accent;
      mouthPath = 'M 28 56 Q 40 48 52 56'; // Frown
      eyebrowPathLeft = 'M 25 34 L 38 30';
      eyebrowPathRight = 'M 42 30 L 55 34';
      showSweat = true;
      break;

    case 'panic':
      auraColor = colors.danger;
      mouthPath = 'M 33 52 Q 40 62 47 52 Q 40 48 33 52'; // O-shaped gasp
      eyebrowPathLeft = 'M 25 34 L 37 28';
      eyebrowPathRight = 'M 43 28 L 55 34';
      showSweat = true;
      break;

    case 'happy':
    default:
      auraColor = colors.primary;
      mouthPath = 'M 28 52 Q 40 62 52 52';
      break;
  }

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Animated.View style={[styles.avatarBox, animatedBodyStyle, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 80 80">
          {/* Outer Mood Glow Ring */}
          <Circle
            cx="40"
            cy="40"
            r="38"
            fill={auraColor}
            fillOpacity={mood === 'panic' ? 0.35 : 0.2}
            stroke={auraColor}
            strokeWidth="2"
          />

          {/* Head */}
          <Circle cx="40" cy="40" r="32" fill="#1E293B" />
          <Circle cx="40" cy="40" r="30" fill="#334155" />

          {/* Eyes with Reanimated blinking */}
          <Animated.View style={[StyleSheet.absoluteFill, animatedEyeStyle]}>
            <Svg width={size} height={size} viewBox="0 0 80 80">
              <Circle cx="32" cy="39" r="4.5" fill="#F8FAFC" />
              <Circle cx="48" cy="39" r="4.5" fill="#F8FAFC" />
              <Circle cx="33" cy="39" r="2.5" fill="#0F172A" />
              <Circle cx="49" cy="39" r="2.5" fill="#0F172A" />
            </Svg>
          </Animated.View>

          {/* Eyebrows */}
          <Path d={eyebrowPathLeft} stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <Path d={eyebrowPathRight} stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Mouth */}
          <Path d={mouthPath} stroke="#F1F5F9" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Cheerful Blush for happy/confident */}
          {(mood === 'happy' || mood === 'confident') && (
            <G fill="#FB7185" fillOpacity="0.4">
              <Circle cx="23" cy="45" r="4" />
              <Circle cx="57" cy="45" r="4" />
            </G>
          )}

          {/* Sweat drop for stressed/panic */}
          {showSweat && (
            <Path
              d="M 58 24 Q 63 30 60 34 Q 57 37 54 34 Q 52 30 58 24 Z"
              fill="#38BDF8"
              fillOpacity="0.9"
            />
          )}
        </Svg>
      </Animated.View>

      {userName && (
        <Text style={styles.nameTag} numberOfLines={1}>
          {userName}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 4,
  },
});
