import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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
                <Image
                  source={opt.image}
                  style={styles.dietImage}
                  resizeMode="contain"
                />
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
        <View style={styles.allergenGrid}>
          {ALLERGEN_OPTIONS.map((allergen) => {
            const isSelected = selectedAllergens.includes(allergen.id);
            return (
              <Pressable
                key={allergen.id}
                onPress={() => toggleAllergen(allergen.id)}
                style={[
                  styles.allergenCard,
                  {
                    backgroundColor: isSelected
                      ? colors.primaryLight
                      : colors.card,
                    borderColor: isSelected
                      ? colors.primary
                      : colors.borderLight,
                  },
                ]}
              >
                {isSelected && (
                  <View style={styles.allergenCheck}>
                    <MaterialIcons name="check" size={14} color={colors.textOnPrimary} />
                  </View>
                )}
                <Image
                  source={allergen.icon}
                  style={styles.allergenIcon}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.allergenLabel,
                    {
                      color: isSelected
                        ? colors.primary
                        : colors.text,
                    },
                  ]}
                  numberOfLines={1}
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

const f = typography.family;

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
  heading: {
    fontSize: typography.size["5xl"],
    fontFamily: f.headingBold,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: typography.size.xl,
    fontFamily: f.body,
    marginTop: spacing.xs,
    marginBottom: spacing["2xl"],
  },
  sectionLabel: {
    fontSize: typography.size["2xl"],
    fontFamily: f.headingBold,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
    alignSelf: "flex-start",
  },

  // Diet grid
  dietGrid: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  dietCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: spacing.sm,
    aspectRatio: 0.85,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  dietImage: {
    width: "75%",
    height: "75%",
    position: "absolute",
    top: "5%",
    alignSelf: "center",
  },
  dietLabel: {
    fontSize: typography.size.lg,
    fontFamily: f.bodySemibold,
  },

  // Allergen grid — 3 columns with prominent icons
  allergenGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    width: "100%",
  },
  allergenCard: {
    width: "30.5%",
    alignItems: "center",
    justifyContent: "flex-end",
    aspectRatio: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingBottom: spacing.sm,
    overflow: "hidden",
  },
  allergenCheck: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  allergenIcon: {
    width: "70%",
    height: "70%",
    position: "absolute",
    top: "5%",
    alignSelf: "center",
  },
  allergenLabel: {
    fontSize: typography.size.sm,
    fontFamily: f.bodySemibold,
    textAlign: "center",
  },

  footer: {
    paddingHorizontal: spacing["2xl"],
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
});
