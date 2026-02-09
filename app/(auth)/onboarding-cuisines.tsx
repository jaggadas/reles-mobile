import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { SwipeCardDeck } from "@/components/SwipeCardDeck";
import { CUISINE_CARDS } from "@/constants/cuisines";
import { useThemeColor } from "@/hooks/use-theme-color";
import { colors, spacing, typography } from "@/constants/colors";

export default function OnboardingCuisinesScreen() {
  const router = useRouter();

  const bgColor = useThemeColor(
    { light: colors.light.background, dark: colors.dark.background },
    "background"
  );
  const textColor = useThemeColor(
    { light: colors.light.text, dark: colors.dark.text },
    "text"
  );
  const subtextColor = useThemeColor(
    { light: colors.light.textSecondary, dark: colors.dark.textSecondary },
    "text"
  );

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
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <OnboardingProgress currentStep={2} totalSteps={3} />

      <View style={styles.header}>
        <Text style={styles.illustration}>🍳</Text>
        <Text style={[styles.heading, { color: textColor }]}>
          What do you love?
        </Text>
        <Text style={[styles.subheading, { color: subtextColor }]}>
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
