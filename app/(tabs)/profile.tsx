import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { Button } from '@/components/ui/Button';
import { ALLERGEN_OPTIONS } from '@/constants/allergens';
import { colors, radius, shadows, spacing, typography } from '@/constants/colors';
import { CUISINE_CARDS } from '@/constants/cuisines';
import { DIETARY_OPTIONS } from '@/constants/dietary';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function ProfileScreen() {
  const { user, logout, savePreferences } = useAuth();
  const { isPro, isTrialActive, remainingExtractions, weeklyLimit, showPaywall } =
    useSubscription();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  // Editable preference state
  const [diet, setDiet] = useState<string>('none');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [likedCuisines, setLikedCuisines] = useState<string[]>([]);
  const initialized = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Sync from user preferences on mount
  useEffect(() => {
    if (!user?.preferences) return;
    const p = user.preferences;
    if (p.dietaryRestrictions.isVegan) setDiet('vegan');
    else if (p.dietaryRestrictions.isVegetarian) setDiet('vegetarian');
    else setDiet('none');
    setSelectedAllergens(p.allergens);
    setLikedCuisines(p.likedCuisines);
    initialized.current = true;
  }, [user?.preferences]);

  // Auto-save with debounce
  const autoSave = useCallback(
    (newDiet: string, newAllergens: string[], newCuisines: string[]) => {
      if (!initialized.current) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          await savePreferences({
            likedCuisines: newCuisines,
            dietaryRestrictions: {
              isVegetarian: newDiet === 'vegetarian' || newDiet === 'vegan',
              isVegan: newDiet === 'vegan',
            },
            favoriteCategories: user?.preferences?.favoriteCategories ?? [],
            allergens: newAllergens,
          });
        } catch {
          // Silent fail — user can retry by tapping again
        }
      }, 800);
    },
    [savePreferences, user?.preferences?.favoriteCategories],
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const changeDiet = (id: string) => {
    setDiet(id);
    autoSave(id, selectedAllergens, likedCuisines);
  };

  const toggleAllergen = (id: string) => {
    const next = selectedAllergens.includes(id)
      ? selectedAllergens.filter((a) => a !== id)
      : [...selectedAllergens, id];
    setSelectedAllergens(next);
    autoSave(diet, next, likedCuisines);
  };

  const toggleCuisine = (id: string) => {
    const next = likedCuisines.includes(id)
      ? likedCuisines.filter((c) => c !== id)
      : [...likedCuisines, id];
    setLikedCuisines(next);
    autoSave(diet, selectedAllergens, next);
  };

  const doLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      doLogout();
      return;
    }
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: doLogout },
    ]);
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const planLabel = isPro ? 'Pro' : isTrialActive ? 'Trial' : 'Free';
  const used = weeklyLimit - remainingExtractions;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: tabBarHeight + spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.name ?? 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
        </View>

        {/* Subscription Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Subscription</Text>
            <View style={[styles.badge, isPro && styles.badgePro]}>
              <Text style={[styles.badgeText, isPro && styles.badgeTextPro]}>
                {planLabel}
              </Text>
            </View>
          </View>

          <View style={styles.extractionRow}>
            <Text style={styles.extractionLabel}>Recipes this week</Text>
            <Text style={styles.extractionValue}>
              {used} / {weeklyLimit}
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${weeklyLimit > 0 ? (used / weeklyLimit) * 100 : 0}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.extractionHint}>
            {remainingExtractions} extraction
            {remainingExtractions !== 1 ? 's' : ''} remaining
          </Text>

          {!isPro && (
            <Button
              title="Upgrade to Pro"
              onPress={() => showPaywall()}
              icon="star"
              style={{ marginTop: spacing.lg }}
            />
          )}
        </View>

        {/* Diet */}
        <Text style={styles.sectionLabel}>I eat...</Text>
        <View style={styles.dietGrid}>
          {DIETARY_OPTIONS.map((opt) => {
            const isSelected = diet === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => changeDiet(opt.id)}
                style={[
                  styles.dietCard,
                  {
                    backgroundColor: isSelected
                      ? colors.primaryLight
                      : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
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
                    { color: isSelected ? colors.primary : colors.text },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Allergens */}
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
                    <MaterialIcons
                      name="check"
                      size={14}
                      color={colors.textOnPrimary}
                    />
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
                    { color: isSelected ? colors.primary : colors.text },
                  ]}
                  numberOfLines={1}
                >
                  {allergen.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Cuisines */}
        <Text style={styles.sectionLabel}>Cuisines I love</Text>
        <View style={styles.cuisineGrid}>
          {CUISINE_CARDS.map((c) => {
            const isSelected = likedCuisines.includes(c.id);
            return (
              <Pressable
                key={c.id}
                onPress={() => toggleCuisine(c.id)}
                style={[
                  styles.cuisineCard,
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
                  <View style={styles.cuisineCheck}>
                    <MaterialIcons
                      name="check"
                      size={14}
                      color={colors.textOnPrimary}
                    />
                  </View>
                )}
                <Text style={styles.cuisineEmoji}>{c.emoji}</Text>
                <Text
                  style={[
                    styles.cuisineLabel,
                    { color: isSelected ? colors.primary : colors.text },
                  ]}
                >
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Logout */}
        <Button
          title="Log out"
          onPress={handleLogout}
          variant="destructive"
          icon="logout"
          style={{ marginTop: spacing.xl }}
        />
      </ScrollView>
    </View>
  );
}

const AVATAR_SIZE = 72;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: typography.size['4xl'],
    fontFamily: typography.family.headingBold,
    color: colors.primary,
  },
  userName: {
    fontSize: typography.size['3xl'],
    fontFamily: typography.family.headingBold,
    color: colors.text,
  },
  userEmail: {
    fontSize: typography.size.base,
    fontFamily: typography.family.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Subscription card
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.size['2xl'],
    fontFamily: typography.family.headingBold,
    color: colors.text,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.background,
  },
  badgePro: {
    backgroundColor: colors.primaryLight,
  },
  badgeText: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.bodySemibold,
    color: colors.textSecondary,
  },
  badgeTextPro: {
    color: colors.primary,
  },
  extractionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  extractionLabel: {
    fontSize: typography.size.base,
    fontFamily: typography.family.body,
    color: colors.textSecondary,
  },
  extractionValue: {
    fontSize: typography.size.base,
    fontFamily: typography.family.bodySemibold,
    color: colors.text,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.progressTrack,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.progressFill,
    borderRadius: 3,
  },
  extractionHint: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },

  // Section labels (matches onboarding)
  sectionLabel: {
    fontSize: typography.size['2xl'],
    fontFamily: typography.family.headingBold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },

  // Diet grid (matches onboarding)
  dietGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dietCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.sm,
    aspectRatio: 0.85,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  dietImage: {
    width: '75%',
    height: '75%',
    position: 'absolute',
    top: '5%',
    alignSelf: 'center',
  },
  dietLabel: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.bodySemibold,
  },

  // Allergen grid (matches onboarding)
  allergenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  allergenCard: {
    width: '30.5%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    aspectRatio: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingBottom: spacing.sm,
    overflow: 'hidden',
  },
  allergenCheck: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  allergenIcon: {
    width: '70%',
    height: '70%',
    position: 'absolute',
    top: '5%',
    alignSelf: 'center',
  },
  allergenLabel: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.bodySemibold,
    textAlign: 'center',
  },

  // Cuisine grid
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cuisineCard: {
    width: '30.5%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    aspectRatio: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingBottom: spacing.sm,
    overflow: 'hidden',
  },
  cuisineCheck: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  cuisineEmoji: {
    fontSize: 36,
    position: 'absolute',
    top: '15%',
    alignSelf: 'center',
  },
  cuisineLabel: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.bodySemibold,
    textAlign: 'center',
  },
});
