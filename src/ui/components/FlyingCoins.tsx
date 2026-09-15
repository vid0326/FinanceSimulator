/**
 * Flying Currency Particle Burst Effect using React Native Reanimated
 * Native 60fps physics-driven coin celebration for salary credits and investment windfalls.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface CoinParticleProps {
  index: number;
  startX: number;
  startY: number;
  angle: number;
  distance: number;
}

const CoinParticle: React.FC<CoinParticleProps> = ({ startX, startY, angle, distance }) => {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(1);

  const rad = (angle * Math.PI) / 180;
  const targetX = Math.cos(rad) * distance;
  const targetY = Math.sin(rad) * distance - 40; // Slight upward bias

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 850,
      easing: Easing.out(Easing.cubic),
    });

    opacity.value = withDelay(
      450,
      withTiming(0, {
        duration: 400,
        easing: Easing.linear,
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const currentX = startX + targetX * progress.value;
    const currentY = startY + targetY * progress.value;
    const scale = 0.6 + 0.5 * (1 - progress.value);
    const rotation = `${progress.value * 360}deg`;

    return {
      position: 'absolute',
      left: currentX,
      top: currentY,
      opacity: opacity.value,
      transform: [{ scale }, { rotate: rotation }],
    };
  });

  return (
    <Animated.View style={animatedStyle} pointerEvents="none">
      <View style={styles.coinCircle}>
        <Ionicons name="cash" size={16} color="#FFFBEB" />
      </View>
    </Animated.View>
  );
};

interface FlyingCoinsProps {
  triggerKey: number;
  particleCount?: number;
  originX?: number;
  originY?: number;
  onComplete?: () => void;
}

export const FlyingCoins: React.FC<FlyingCoinsProps> = ({
  triggerKey,
  particleCount = 14,
  originX = 180,
  originY = 300,
}) => {
  if (triggerKey === 0) return null;

  const particles = Array.from({ length: particleCount }).map((_, i) => ({
    angle: (i / particleCount) * 360,
    distance: 70 + Math.random() * 80,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, idx) => (
        <CoinParticle
          key={`${triggerKey}_${idx}`}
          index={idx}
          startX={originX}
          startY={originY}
          angle={p.angle}
          distance={p.distance}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  coinCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FEF3C7',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
  },
});
