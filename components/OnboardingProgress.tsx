import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, spacing, radius } from "@/constants/colors";
import { useThemeColor } from "@/hooks/use-theme-color";

interface Props {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: Props) {
  const trackColor = useThemeColor(
    { light: colors.light.progressTrack, dark: colors.dark.progressTrack },
    "background"
  );
  const fillColor = useThemeColor(
    { light: colors.light.progressFill, dark: colors.dark.progressFill },
    "tint"
  );

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            {
              backgroundColor:
                i < currentStep ? (fillColor as string) : (trackColor as string),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
  },
});
