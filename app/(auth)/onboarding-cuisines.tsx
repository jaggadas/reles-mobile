import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { SwipeCardDeck } from "@/components/SwipeCardDeck";
import { CUISINE_CARDS } from "@/constants/cuisines";
import { colors, spacing, typography } from "@/constants/colors";

export default function OnboardingCuisinesScreen() {
  const router = useRouter();

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <OnboardingProgress currentStep={2} totalSteps={3} />

      <View style={styles.header}>
        <Text style={styles.illustration}>🍳</Text>
        <Text style={[styles.heading, { color: colors.text }]}>
          What do you love?
        </Text>
        <Text style={[styles.subheading, { color: colors.textSecondary }]}>
          Swipe right to like, left to skip
        </Text>
      </View>

      <GestureHandlerRootView style={styles.deck}>
        <SwipeCardDeck cards={CUISINE_CARDS} onComplete={handleComplete} />
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: spacing.lg,
    gap: spacing.xs,
  },
  illustration: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  heading: {
    fontSize: typography.size["5xl"],
    fontWeight: typography.weight.bold,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: typography.size.xl,
  },
  deck: {
    flex: 1,
  },
});
