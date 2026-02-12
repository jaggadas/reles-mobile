import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SwipeCardDeck } from "@/components/SwipeCardDeck";
import { CUISINE_CARDS } from "@/constants/cuisines";
import { colors, spacing, typography } from "@/constants/colors";

export default function OnboardingCuisinesScreen() {
  const router = useRouter();
  const { top: safeTop } = useSafeAreaInsets();

  const handleComplete = useCallback(
    (liked: string[]) => {
      router.push({
        pathname: "/(auth)/onboarding-dietary",
        params: { cuisines: JSON.stringify(liked) },
      });
    },
    [router]
  );

  return (
    <View style={styles.container}>
      <View style={[styles.pageHeader, { paddingTop: safeTop + spacing.xl }]}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.pageTitle}>What do you love?</Text>
          <View style={styles.rule} />
        </View>
        <Text style={styles.pageSubtitle}>
          Swipe right to like, left to skip
        </Text>
      </View>

      <GestureHandlerRootView style={styles.deck}>
        <SwipeCardDeck cards={CUISINE_CARDS} onComplete={handleComplete} />
      </GestureHandlerRootView>
    </View>
  );
}

const f = typography.family;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Page Header ────────────────────────────────────────
  pageHeader: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  pageTitle: {
    fontFamily: f.headingBold,
    fontSize: typography.size['3xl'],
    fontVariant: ['no-common-ligatures'],
    color: colors.primary,
  },
  rule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  pageSubtitle: {
    fontSize: typography.size.base,
    fontFamily: f.body,
    color: colors.textSecondary,
  },

  deck: {
    flex: 1,
  },
});
