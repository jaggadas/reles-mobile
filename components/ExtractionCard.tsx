import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { ExtractionPhase } from '@/lib/types';
import { colors, spacing, radius, typography } from '@/constants/colors';

// ── Props ─────────────────────────────────────────────────────

interface Props {
  phase: ExtractionPhase;
  error?: string | null;
}

// ── Constants ─────────────────────────────────────────────────

const ALL_EMOJIS = [
  '🍅', '🥕', '🧅', '🌶️', '🥦', '🍋', '🧄', '🫒',
  '🥑', '🍳', '🧈', '🌿', '🍝', '🥘', '🍕', '🧀',
  '🍗', '🥩', '🫑', '🍚', '🥧', '🍰', '🫐', '🍊',
  '🥥', '🍇', '🫘', '🥬', '🍠', '🧁', '🥞', '🍯',
];

const FETCHING_MESSAGES = [
  'Reading the video for you',
  'Grabbing the transcript',
  'Preparing to extract',
];

const EXTRACTING_MESSAGES = [
  'Extracting ingredients',
  'Finding instructions',
  'Analyzing the recipe',
  'Almost there, plating up',
];

const EMOJI_COUNT = 3;
const EMOJI_CYCLE_MS = 1200;

function pickRandom(exclude: string[]): string {
  const pool = ALL_EMOJIS.filter((e) => !exclude.includes(e));
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Cycling Emoji Slot ───────────────────────────────────────

function EmojiSlot({ interval, size }: { interval: number; size: number }) {
  const [emoji, setEmoji] = useState(() => ALL_EMOJIS[Math.floor(Math.random() * ALL_EMOJIS.length)]);
  const prevRef = useRef(emoji);

  useEffect(() => {
    const id = setInterval(() => {
      setEmoji((prev) => {
        const next = pickRandom([prev]);
        prevRef.current = prev;
        return next;
      });
    }, interval);
    return () => clearInterval(id);
  }, [interval]);

  return (
    <View style={styles.emojiSlot}>
      <Animated.Text
        key={emoji}
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={{ fontSize: size, lineHeight: size * 1.2, textAlign: 'center' }}
      >
        {emoji}
      </Animated.Text>
    </View>
  );
}

// ── Progress Bar ──────────────────────────────────────────────

function ProgressBar({ phase }: { phase: ExtractionPhase }) {
  const width = useSharedValue(0);

  useEffect(() => {
    if (phase === 'fetching') {
      width.value = withTiming(30, { duration: 4000, easing: Easing.out(Easing.quad) });
    } else if (phase === 'extracting') {
      width.value = withSequence(
        withTiming(55, { duration: 600, easing: Easing.out(Easing.quad) }),
        withTiming(92, { duration: 20000, easing: Easing.linear }),
      );
    } else {
      width.value = withTiming(100, { duration: 300 });
    }
  }, [phase]);

  const animStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, animStyle]} />
    </View>
  );
}

// ── Main Component ────────────────────────────────────────────

export function ExtractionCard({ phase, error }: Props) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [prevPhase, setPrevPhase] = useState<ExtractionPhase>('idle');

  const messages = phase === 'fetching' ? FETCHING_MESSAGES : EXTRACTING_MESSAGES;

  // Phase transition haptic
  useEffect(() => {
    if (prevPhase === 'fetching' && phase === 'extracting') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setPrevPhase(phase);
  }, [phase]);

  // Cycle messages
  useEffect(() => {
    if (phase === 'idle') {
      setMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [phase, messages.length]);

  if (phase === 'idle' && !error) return null;

  if (error) {
    return (
      <View style={styles.errorCard}>
        <MaterialIcons name="error-outline" size={20} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.wrapper}>
      <View style={styles.card}>
        {/* Emoji row */}
        <View style={styles.emojiRow}>
          {Array.from({ length: EMOJI_COUNT }).map((_, i) => (
            <EmojiSlot
              key={i}
              interval={EMOJI_CYCLE_MS + i * 400}
              size={36}
            />
          ))}
        </View>

        {/* Status text */}
        <View style={styles.messageContainer}>
          <Animated.Text
            key={`${phase}-${messageIndex}`}
            entering={FadeIn.duration(350)}
            exiting={FadeOut.duration(350)}
            style={styles.messageText}
          >
            {messages[messageIndex]}
          </Animated.Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <ProgressBar phase={phase} />
        </View>
      </View>
    </Animated.View>
  );
}

// ── Styles ────────────────────────────────────────────────────

const f = typography.family;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.xl,
  },
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
  },

  // ── Emoji row ─────────────────────────────────────────
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  emojiSlot: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Message ─────────────────────────────────────────────
  messageContainer: {
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  messageText: {
    fontSize: typography.size.base,
    fontFamily: f.bodySemibold,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // ── Progress bar ──────────────────────────────────────
  progressSection: {
    paddingHorizontal: spacing.xl,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.progressTrack,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },

  // ── Error ─────────────────────────────────────────────
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
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  errorText: {
    flex: 1,
    fontSize: typography.size.base,
    fontFamily: f.bodyMedium,
    color: colors.error,
  },
});
