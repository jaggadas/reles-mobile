import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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

  const { top: safeTop } = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.pageHeader, { paddingTop: safeTop + spacing.xl }]}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.pageTitle}>Dietary Preferences</Text>
          <View style={styles.rule} />
        </View>
        <Text style={styles.pageSubtitle}>
          Choose as many as apply
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>I eat...</Text>
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
                {isSelected && (
                  <View style={styles.dietCheck}>
                    <MaterialIcons name="check" size={14} color={colors.textOnPrimary} />
                  </View>
                )}
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

        <Text style={styles.sectionLabel}>Allergens to avoid</Text>
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
        <Text style={styles.footerNote}>
          You can change these anytime in your profile settings.
        </Text>
      </View>
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

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },

  // Section labels (matches profile.tsx pattern)
  sectionLabel: {
    fontSize: typography.size['2xl'],
    fontFamily: f.headingBold,
    fontVariant: ['no-common-ligatures'],
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },

  // Diet grid
  dietGrid: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
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
  dietCheck: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
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
    paddingHorizontal: spacing.xl,
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
    zIndex: 1,
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
  footerNote: {
    fontSize: typography.size.sm,
    fontFamily: f.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
