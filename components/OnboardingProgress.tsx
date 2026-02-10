import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, spacing, radius } from "@/constants/colors";

interface Props {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: Props) {
  const trackColor = colors.progressTrack;
  const fillColor = colors.progressFill;

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            {
              backgroundColor:
                i < currentStep ? fillColor : trackColor,
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
