import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ExtractionPhase } from '@/lib/types';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';

interface Props {
  phase: ExtractionPhase;
  error?: string | null;
}

const PHASE_CONFIG: Record<ExtractionPhase, { label: string; icon: string; step: number }> = {
  idle: { label: '', icon: '', step: 0 },
  fetching: { label: 'Finding video', icon: 'play-circle-outline', step: 1 },
  'fetching-transcript': { label: 'Getting transcript', icon: 'subtitles', step: 2 },
  reading: { label: 'Reading transcript', icon: 'auto-stories', step: 3 },
  extracting: { label: 'Extracting recipe', icon: 'restaurant', step: 4 },
  success: { label: 'Recipe ready!', icon: 'check-circle', step: 5 },
};

function ShimmerBlock({ width, height, style, shimmerAnim }: {
  width: number | `${number}%`;
  height: number;
  style?: object;
  shimmerAnim: Animated.Value;
}) {
  const baseColor = colors.progressTrack;

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 1, 0.4],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius.sm,
          backgroundColor: baseColor,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ExtractionCard({ phase, error }: Props) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const cardBg = colors.card;
  const textColor = colors.text;
  const subtextColor = colors.textSecondary;
  const errorColor = colors.error;
  const errorBg = colors.errorLight;
  const successColor = colors.success;
  const primaryColor = colors.primary;
  const progressTrack = colors.progressTrack;
  const borderColor = colors.borderLight;

  useEffect(() => {
    if (phase !== 'idle') {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const loop = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      );
      loop.start();

      return () => loop.stop();
    } else {
      fadeAnim.setValue(0);
    }
  }, [phase]);

  if (phase === 'idle' && !error) return null;

  if (error) {
    return (
      <View style={[styles.errorCard, { backgroundColor: errorBg, borderColor: errorColor }]}>
        <MaterialIcons name="error-outline" size={20} color={errorColor} />
        <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
      </View>
    );
  }

  const config = PHASE_CONFIG[phase];
  const isSuccess = phase === 'success';
  const totalSteps = 4;
  const currentStep = Math.min(config.step, totalSteps);

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      {/* Status header */}
      <View style={[styles.statusBar, { backgroundColor: cardBg, borderColor: borderColor }]}>
        <View style={styles.statusLeft}>
          <MaterialIcons
            name={config.icon as any}
            size={20}
            color={isSuccess ? successColor : primaryColor}
          />
          <Text style={[
            styles.statusLabel,
            { color: isSuccess ? successColor : textColor },
          ]}>
            {config.label}
          </Text>
        </View>
        {!isSuccess && (
          <Text style={[styles.stepLabel, { color: subtextColor }]}>
            Step {currentStep}/{totalSteps}
          </Text>
        )}
      </View>

      {/* Progress dots */}
      {!isSuccess && (
        <View style={styles.progressDots}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i < currentStep
                      ? primaryColor
                      : progressTrack,
                },
              ]}
            />
          ))}
        </View>
      )}

      {/* Skeleton recipe card */}
      {!isSuccess && (
        <View style={[styles.skeletonCard, { backgroundColor: cardBg, borderColor: borderColor }]}>
          {/* Thumbnail skeleton */}
          <ShimmerBlock width="100%" height={160} shimmerAnim={shimmerAnim} style={{ borderRadius: radius.md }} />

          {/* Content skeleton */}
          <View style={styles.skeletonContent}>
            {/* Title */}
            <ShimmerBlock width="75%" height={20} shimmerAnim={shimmerAnim} />
            <ShimmerBlock width="50%" height={14} shimmerAnim={shimmerAnim} style={{ marginTop: 8 }} />

            {/* Meta row */}
            <View style={styles.skeletonMetaRow}>
              <ShimmerBlock width={70} height={28} shimmerAnim={shimmerAnim} style={{ borderRadius: radius.full }} />
              <ShimmerBlock width={70} height={28} shimmerAnim={shimmerAnim} style={{ borderRadius: radius.full }} />
              <ShimmerBlock width={70} height={28} shimmerAnim={shimmerAnim} style={{ borderRadius: radius.full }} />
            </View>

            {/* Ingredient lines */}
            <View style={styles.skeletonLines}>
              <ShimmerBlock width="90%" height={12} shimmerAnim={shimmerAnim} />
              <ShimmerBlock width="70%" height={12} shimmerAnim={shimmerAnim} />
              <ShimmerBlock width="80%" height={12} shimmerAnim={shimmerAnim} />
              <ShimmerBlock width="60%" height={12} shimmerAnim={shimmerAnim} />
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const f = typography.family;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusLabel: {
    fontSize: typography.size.xl,
    fontFamily: f.bodySemibold,
  },
  stepLabel: {
    fontSize: typography.size.sm,
    fontFamily: f.bodyMedium,
  },
  progressDots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  skeletonCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.sm,
  },
  skeletonContent: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  skeletonMetaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  skeletonLines: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    fontSize: typography.size.base,
    fontFamily: f.bodyMedium,
  },
});
