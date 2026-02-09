import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { Button } from "@/components/ui";
import { DIETARY_OPTIONS, FOOD_CATEGORIES } from "@/constants/dietary";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { colors, spacing, radius, typography } from "@/constants/colors";

export default function OnboardingDietaryScreen() {
  const params = useLocalSearchParams<{ cuisines: string }>();
  const { savePreferences } = useAuth();

  const [diet, setDiet] = useState<string>("none");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
  const primaryColor = useThemeColor(
    { light: colors.light.primary, dark: colors.dark.primary },
    "tint"
  );
  const primaryTextColor = useThemeColor(
    { light: colors.light.textOnPrimary, dark: colors.dark.textOnPrimary },
    "text"
  );
  const primaryLight = useThemeColor(
    { light: colors.light.primaryLight, dark: colors.dark.primaryLight },
    "background"
  );
  const cardBg = useThemeColor(
    { light: colors.light.inputBackground, dark: colors.dark.inputBackground },
    "background"
  );
  const borderColor = useThemeColor(
    { light: colors.light.border, dark: colors.dark.border },
    "text"
  );

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    const likedCuisines: string[] = params.cuisines
      ? JSON.parse(params.cuisines)
      : [];

    setLoading(true);
    try {
      await savePreferences({
        likedCuisines,
        dietaryRestrictions: {
          isVegetarian: diet === "vegetarian" || diet === "vegan",
          isVegan: diet === "vegan",
        },
        favoriteCategories: selectedCategories,
      });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <OnboardingProgress currentStep={3} totalSteps={3} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.illustration}>🥑</Text>

        <Text style={[styles.heading, { color: textColor }]}>
          Dietary preferences
        </Text>
        <Text style={[styles.subheading, { color: subtextColor }]}>
          Choose as many as apply
        </Text>

        <Text style={[styles.sectionLabel, { color: textColor }]}>
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
                      ? (primaryLight as string)
                      : (cardBg as string),
                    borderColor: isSelected
                      ? (primaryColor as string)
                      : (borderColor as string),
                  },
                ]}
              >
                <Text style={styles.dietEmoji}>{opt.emoji}</Text>
                <Text
                  style={[
                    styles.dietLabel,
                    {
                      color: isSelected
                        ? (primaryColor as string)
                        : (textColor as string),
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: textColor }]}>
          I love making...
        </Text>
        <View style={styles.chipGrid}>
          {FOOD_CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id);
            return (
              <Pressable
                key={cat.id}
                onPress={() => toggleCategory(cat.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected
                      ? (primaryColor as string)
                      : (cardBg as string),
                    borderColor: isSelected
                      ? (primaryColor as string)
                      : (borderColor as string),
                  },
                ]}
              >
                <Text style={styles.chipEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.chipLabel,
                    {
                      color: isSelected
                        ? (primaryTextColor as string)
                        : (textColor as string),
                    },
                  ]}
                >
                  {cat.label}
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
