import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { Button } from "@/components/ui";
import { DIETARY_OPTIONS } from "@/constants/dietary";
import { ALLERGEN_OPTIONS } from "@/constants/allergens";
import { useOnboardingDietary } from "@/hooks/useOnboardingDietary";
import { colors, spacing, radius, typography } from "@/constants/colors";

export default function OnboardingDietaryScreen() {
  const {
    diet,
    setDiet,
    selectedAllergens,
    loading,
    toggleAllergen,
    handleFinish,
  } = useOnboardingDietary();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <OnboardingProgress currentStep={3} totalSteps={3} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.illustration}>🥑</Text>

        <Text style={[styles.heading, { color: colors.text }]}>
          Dietary preferences
        </Text>
        <Text style={[styles.subheading, { color: colors.textSecondary }]}>
          Choose as many as apply
        </Text>

        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          I eat...
        </Text>
        <View style={styles.dietGrid}>
          {DIETARY_OPTIONS.map((opt) => {
            const isSelected = diet === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setDiet(opt.id)}
                style={[
                  styles.dietCard,
                  {
                    backgroundColor: isSelected
                      ? colors.primaryLight
                      : colors.card,
                    borderColor: isSelected
                      ? colors.primary
                      : colors.border,
                  },
                ]}
              >
                <Text style={styles.dietEmoji}>{opt.emoji}</Text>
                <Text
                  style={[
                    styles.dietLabel,
                    {
                      color: isSelected
                        ? colors.primary
                        : colors.text,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          Allergens to avoid
        </Text>
        <View style={styles.chipGrid}>
          {ALLERGEN_OPTIONS.map((allergen) => {
            const isSelected = selectedAllergens.includes(allergen.id);
            return (
              <Pressable
                key={allergen.id}
                onPress={() => toggleAllergen(allergen.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : "transparent",
                    borderColor: isSelected
                      ? colors.primary
                      : colors.border,
                  },
                ]}
              >
                <Text style={styles.chipEmoji}>{allergen.emoji}</Text>
                <Text
                  style={[
                    styles.chipLabel,
                    {
                      color: isSelected
                        ? colors.textOnPrimary
                        : colors.text,
                    },
                  ]}
                >
                  {allergen.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Get Started"
          onPress={handleFinish}
          loading={loading}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: "center",
  },
  illustration: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: typography.size["5xl"],
    fontWeight: typography.weight.bold,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: typography.size.xl,
    marginTop: spacing.xs,
    marginBottom: spacing["2xl"],
  },
  sectionLabel: {
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
    alignSelf: "flex-start",
  },
  dietGrid: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  dietCard: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  dietEmoji: {
    fontSize: 28,
  },
  dietLabel: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    width: "100%",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  chipEmoji: {
    fontSize: 18,
  },
  chipLabel: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
  },
  footer: {
    paddingHorizontal: spacing["2xl"],
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
});
