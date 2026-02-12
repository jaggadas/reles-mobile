import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { FadeIn } from 'react-native-reanimated';

import * as WebBrowser from 'expo-web-browser';

import { colors, spacing, radius, typography, palette, shadows } from '@/constants/colors';
import { Button, Tag } from '@/components/ui';
import { ExtractionCard } from '@/components/ExtractionCard';
import { useRecipeExtraction } from '@/hooks/useRecipeExtraction';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { formatDifficulty, formatCuisine, formatAllergens, formatTime } from '@/lib/format';
import {
  addRecipeToGroceryList,
  removeRecipeFromGroceryList,
  isRecipeInGroceryList,
} from '@/lib/storage';
import { createInstacartRecipeLink, apiUnsaveRecipe } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Recipe } from '@/lib/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HERO_HEIGHT = 220;

// ── Section Header ────────────────────────────────────────────
function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>
          {title}
          {count != null ? ` (${count})` : ''}
        </Text>
        <View style={styles.rule} />
      </View>
    </View>
  );
}

// ── Recipe Detail (inline after extraction) ───────────────────
function RecipeDetail({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const { user } = useAuth();

  const userAllergens = user?.preferences?.allergens ?? [];
  const recipeAllergens = recipe.allergens ?? [];
  const intersectingAllergens = recipeAllergens.filter((a) =>
    userAllergens.includes(a.toLowerCase()),
  );

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      {/* Recipe info card */}
      <View style={styles.infoCard}>
        {recipe.cuisine && recipe.cuisine !== 'OTHER' && (
          <View style={styles.infoItem}>
            <MaterialIcons name="restaurant" size={18} color={colors.accent} />
            <Text style={styles.infoValue}>{formatCuisine(recipe.cuisine)}</Text>
            <Text style={styles.infoLabel}>Cuisine</Text>
          </View>
        )}
        {recipe.difficulty ? (
          <View style={styles.infoItem}>
            <MaterialIcons name="signal-cellular-alt" size={18} color={colors.accent} />
            <Text style={styles.infoValue}>{formatDifficulty(recipe.difficulty)}</Text>
            <Text style={styles.infoLabel}>Difficulty</Text>
          </View>
        ) : null}
        {recipe.servings ? (
          <View style={styles.infoItem}>
            <MaterialIcons name="people" size={18} color={colors.accent} />
            <Text style={styles.infoValue}>{recipe.servings}</Text>
            <Text style={styles.infoLabel}>Servings</Text>
          </View>
        ) : null}
        {recipe.prepTimeMinutes ? (
          <View style={styles.infoItem}>
            <MaterialIcons name="timer" size={18} color={colors.accent} />
            <Text style={styles.infoValue}>{formatTime(recipe.prepTimeMinutes)}</Text>
            <Text style={styles.infoLabel}>Prep</Text>
          </View>
        ) : null}
        {recipe.cookTimeMinutes ? (
          <View style={styles.infoItem}>
            <MaterialIcons name="local-fire-department" size={18} color={colors.accent} />
            <Text style={styles.infoValue}>{formatTime(recipe.cookTimeMinutes)}</Text>
            <Text style={styles.infoLabel}>Cook</Text>
          </View>
        ) : null}
        {recipe.caloriesKcal ? (
          <View style={styles.infoItem}>
            <MaterialIcons name="bolt" size={18} color={colors.accent} />
            <Text style={styles.infoValue}>{recipe.caloriesKcal}</Text>
            <Text style={styles.infoLabel}>Calories</Text>
          </View>
        ) : null}
      </View>

      {/* Allergen notice */}
      {intersectingAllergens.length > 0 ? (
        <View style={styles.allergenRow}>
          <MaterialIcons name="warning-amber" size={16} color={colors.allergenIcon} />
          <Text style={styles.allergenRowText}>
            Contains {formatAllergens(intersectingAllergens)} (in your allergens)
          </Text>
        </View>
      ) : recipe.allergens && recipe.allergens.length > 0 ? (
        <View style={styles.allergenRow}>
          <MaterialIcons name="info-outline" size={16} color={colors.allergenIcon} />
          <Text style={styles.allergenRowText}>
            Contains {formatAllergens(recipe.allergens)}
          </Text>
        </View>
      ) : null}

      {/* Highlights */}
      {recipe.highlights && recipe.highlights.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Things to Know" />
          <View style={styles.sectionBody}>
            {recipe.highlights.map((h, idx) => (
              <View key={idx} style={styles.highlightRow}>
                <View style={styles.highlightDot} />
                <Text style={styles.highlightText}>{h}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Ingredients */}
      <View style={styles.section}>
        <SectionHeader title="Ingredients" count={recipe.ingredients.length} />
        <View style={styles.sectionBody}>
          {recipe.ingredients.map((ing, i) => (
            <View key={i} style={styles.ingredientRow}>
              <View style={styles.ingredientBullet} />
              <View style={styles.ingredientContent}>
                <Text style={styles.ingredientQuantity}>{ing.quantity}</Text>
                <Text style={styles.ingredientName}>{ing.name}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Instructions */}
      {recipe.instructions.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Instructions" />
          <View style={styles.sectionBody}>
            {recipe.instructions.map((step, i) => (
              <View key={i} style={styles.instructionRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Source video */}
      {recipe.videoId && (
        <View style={styles.section}>
          <SectionHeader title="Source" />
          <Pressable
            onPress={() => Linking.openURL(recipe.url)}
            style={({ pressed }) => [
              styles.videoCard,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Image
              source={{ uri: recipe.thumbnail }}
              style={styles.videoThumb}
              contentFit="cover"
            />
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle} numberOfLines={2}>
                {recipe.videoTitle || recipe.title}
              </Text>
              {recipe.channelTitle ? (
                <Text style={styles.videoChannel} numberOfLines={1}>
                  {recipe.channelTitle}
                </Text>
              ) : null}
              <View style={styles.videoLinkRow}>
                <MaterialIcons name="play-circle-outline" size={14} color={colors.primary} />
                <Text style={styles.videoLink}>Watch on YouTube</Text>
              </View>
            </View>
          </Pressable>
        </View>
      )}

      {/* Accompanying recipes */}
      {recipe.accompanyingRecipes && recipe.accompanyingRecipes.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Goes Well With" />
          <View style={styles.companionList}>
            {recipe.accompanyingRecipes.map((name, i) => (
              <Pressable
                key={i}
                onPress={() =>
                  router.navigate({ pathname: '/(tabs)', params: { search: name } })
                }
              >
                <Tag label={name} variant="outlined" />
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* AI disclaimer */}
      <View style={styles.disclaimer}>
        <MaterialIcons name="auto-awesome" size={13} color={colors.textMuted} />
        <Text style={styles.disclaimerText}>
          This recipe was generated by AI from the video. Always cross-check details with the
          original source.
        </Text>
      </View>

      {/* Spacer for bottom bar */}
      <View style={{ height: 100 }} />
    </Animated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────────

export default function RecipePreviewScreen() {
  const params = useLocalSearchParams<{
    videoId: string;
    title?: string;
    channelName?: string;
    thumbnail?: string;
  }>();

  const router = useRouter();
  const { top: safeTop, bottom: safeBottom } = useSafeAreaInsets();
  const { remainingExtractions, isPro, showPaywall } = useSubscription();

  const {
    videoTitle,
    channelTitle,
    thumbnailUrl,
    metaLoading,
    phase,
    error,
    startExtraction,
    alreadySaved,
    existingRecipeId,
    savedRecipe,
    streamedIngredients,
    streamedInstructions,
    streamedMetadata,
  } = useRecipeExtraction(params.videoId, params.title, params.channelName);

  const heroUri = params.thumbnail || thumbnailUrl;
  const isExtracting = phase !== 'idle';
  const showRecipe = !!savedRecipe && !isExtracting;
  const hasStreamedData = streamedIngredients.length > 0 || streamedInstructions.length > 0;

  const displayTitle = savedRecipe?.title || videoTitle || 'Recipe';
  const displayChannel = savedRecipe?.channelTitle || channelTitle;

  // Grocery list state (lifted here so bottom bar can render outside ScrollView)
  const [inGroceryList, setInGroceryList] = useState(false);
  const [instacartLoading, setInstacartLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);

  React.useEffect(() => {
    if (savedRecipe) {
      isRecipeInGroceryList(savedRecipe.videoId).then(setInGroceryList);
    }
  }, [savedRecipe?.videoId]);

  async function handleToggleGroceryList() {
    if (!savedRecipe) return;
    if (inGroceryList) {
      await removeRecipeFromGroceryList(savedRecipe.videoId);
      setInGroceryList(false);
    } else {
      await addRecipeToGroceryList(savedRecipe.videoId);
      setInGroceryList(true);
    }
  }

  function handleDelete() {
    if (!savedRecipe) return;
    Alert.alert(
      'Delete Recipe',
      `Are you sure you want to delete "${savedRecipe.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await apiUnsaveRecipe(savedRecipe.videoId);
            router.back();
          },
        },
      ],
    );
  }

  async function handleInstacart() {
    if (!savedRecipe) return;
    setInstacartLoading(true);
    try {
      const url = await createInstacartRecipeLink({
        title: savedRecipe.title,
        ingredients: savedRecipe.ingredients,
        instructions: savedRecipe.instructions,
        servings: savedRecipe.servings,
        prepTimeMinutes: savedRecipe.prepTimeMinutes,
        cookTimeMinutes: savedRecipe.cookTimeMinutes,
        thumbnailUrl: savedRecipe.thumbnail,
        sourceUrl: savedRecipe.url,
      });
      await WebBrowser.openBrowserAsync(url);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to open Instacart');
    } finally {
      setInstacartLoading(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Floating top bar */}
        <View style={[styles.topBar, { top: safeTop + spacing.sm }]}>
          <Pressable
            onPress={() => router.back()}
            style={styles.topBarButton}
            hitSlop={12}
          >
            <MaterialIcons name="arrow-back" size={22} color={colors.text} />
          </Pressable>

          {showRecipe && (
            <Pressable
              onPress={toggleMenu}
              style={styles.topBarButton}
              hitSlop={12}
            >
              <MaterialIcons name="more-vert" size={22} color={colors.text} />
            </Pressable>
          )}
        </View>

        {/* Options menu dropdown */}
        {menuOpen && (
          <Modal transparent animationType="fade" onRequestClose={toggleMenu}>
            <Pressable style={styles.menuOverlay} onPress={toggleMenu}>
              <View style={[styles.menuDropdown, { top: safeTop + spacing.sm + 44 }]}>
                <Pressable
                  onPress={() => {
                    setMenuOpen(false);
                    handleDelete();
                  }}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && { backgroundColor: palette.gray50 },
                  ]}
                >
                  <MaterialIcons name="delete-outline" size={18} color={colors.deleteText} />
                  <Text style={styles.menuItemTextDestructive}>Delete recipe</Text>
                </Pressable>
              </View>
            </Pressable>
          </Modal>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            isExtracting && !hasStreamedData && styles.scrollContentExtracting,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero image */}
          <View style={styles.heroContainer}>
            <Image
              source={{ uri: heroUri }}
              style={styles.heroImage}
              contentFit="cover"
            />
          </View>

          {/* Content area */}
          <View style={[styles.contentArea, isExtracting && !hasStreamedData && styles.contentAreaExtracting]}>
            {/* Title */}
            {metaLoading && !videoTitle ? (
              <View style={styles.titleSkeleton} />
            ) : (
              <Text style={styles.title}>{displayTitle}</Text>
            )}

            {/* Channel name */}
            {displayChannel ? (
              <Text style={styles.channelName}>by {displayChannel}</Text>
            ) : metaLoading ? (
              <View style={styles.channelSkeleton} />
            ) : null}

            {/* State: Extracting */}
            {isExtracting && (
              <>
                <ExtractionCard phase={phase} error={null} />

                {/* Streamed metadata info card */}
                {Object.keys(streamedMetadata).length > 0 && (
                  <Animated.View entering={FadeIn.duration(300)} style={styles.infoCard}>
                    {!!streamedMetadata.cuisine && streamedMetadata.cuisine !== 'OTHER' && (
                      <View style={styles.infoItem}>
                        <MaterialIcons name="restaurant" size={18} color={colors.accent} />
                        <Text style={styles.infoValue}>
                          {formatCuisine(streamedMetadata.cuisine as string)}
                        </Text>
                        <Text style={styles.infoLabel}>Cuisine</Text>
                      </View>
                    )}
                    {streamedMetadata.difficulty ? (
                      <View style={styles.infoItem}>
                        <MaterialIcons name="signal-cellular-alt" size={18} color={colors.accent} />
                        <Text style={styles.infoValue}>
                          {formatDifficulty(streamedMetadata.difficulty as number)}
                        </Text>
                        <Text style={styles.infoLabel}>Difficulty</Text>
                      </View>
                    ) : null}
                    {streamedMetadata.servings ? (
                      <View style={styles.infoItem}>
                        <MaterialIcons name="people" size={18} color={colors.accent} />
                        <Text style={styles.infoValue}>{streamedMetadata.servings as number}</Text>
                        <Text style={styles.infoLabel}>Servings</Text>
                      </View>
                    ) : null}
                    {streamedMetadata.prepTimeMinutes ? (
                      <View style={styles.infoItem}>
                        <MaterialIcons name="timer" size={18} color={colors.accent} />
                        <Text style={styles.infoValue}>
                          {formatTime(streamedMetadata.prepTimeMinutes as number)}
                        </Text>
                        <Text style={styles.infoLabel}>Prep</Text>
                      </View>
                    ) : null}
                    {streamedMetadata.cookTimeMinutes ? (
                      <View style={styles.infoItem}>
                        <MaterialIcons name="local-fire-department" size={18} color={colors.accent} />
                        <Text style={styles.infoValue}>
                          {formatTime(streamedMetadata.cookTimeMinutes as number)}
                        </Text>
                        <Text style={styles.infoLabel}>Cook</Text>
                      </View>
                    ) : null}
                    {streamedMetadata.caloriesKcal ? (
                      <View style={styles.infoItem}>
                        <MaterialIcons name="bolt" size={18} color={colors.accent} />
                        <Text style={styles.infoValue}>
                          {streamedMetadata.caloriesKcal as number}
                        </Text>
                        <Text style={styles.infoLabel}>Calories</Text>
                      </View>
                    ) : null}
                  </Animated.View>
                )}

                {/* Streamed ingredients */}
                {streamedIngredients.length > 0 && (
                  <View style={styles.section}>
                    <SectionHeader title="Ingredients" count={streamedIngredients.length} />
                    <View style={styles.sectionBody}>
                      {streamedIngredients.map((ing, i) => (
                        <Animated.View
                          key={`stream-ing-${i}`}
                          entering={FadeIn.duration(300)}
                          style={styles.ingredientRow}
                        >
                          <View style={styles.ingredientBullet} />
                          <View style={styles.ingredientContent}>
                            <Text style={styles.ingredientQuantity}>{ing.quantity}</Text>
                            <Text style={styles.ingredientName}>{ing.name}</Text>
                          </View>
                        </Animated.View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Streamed instructions */}
                {streamedInstructions.length > 0 && (
                  <View style={styles.section}>
                    <SectionHeader title="Instructions" />
                    <View style={styles.sectionBody}>
                      {streamedInstructions.map((step, i) => (
                        <Animated.View
                          key={`stream-inst-${i}`}
                          entering={FadeIn.duration(300)}
                          style={styles.instructionRow}
                        >
                          <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>{i + 1}</Text>
                          </View>
                          <Text style={styles.instructionText}>{step}</Text>
                        </Animated.View>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}

            {/* State: Recipe loaded — render detail inline */}
            {showRecipe && <RecipeDetail recipe={savedRecipe} />}

            {/* State: Idle — save button & quota */}
            {!isExtracting && !showRecipe && (
              <>
                {alreadySaved ? (
                  <Button
                    title="View Recipe"
                    icon="bookmark"
                    onPress={() => router.push(`/recipe/${existingRecipeId}`)}
                    variant="primary"
                    flex
                  />
                ) : (
                  <Button
                    title="Save to Recipes"
                    icon="bookmark-add"
                    onPress={startExtraction}
                    variant="primary"
                    flex
                  />
                )}

                <View style={styles.quotaCard}>
                  <MaterialIcons name="auto-awesome" size={18} color={colors.primary} />
                  <Text style={styles.quotaText}>
                    {remainingExtractions} recipe
                    {remainingExtractions !== 1 ? 's' : ''} remaining
                    {!isPro ? ' this week' : ''}
                  </Text>
                  {!isPro && (
                    <Pressable onPress={() => showPaywall()} hitSlop={8}>
                      <Text style={styles.upgradeLink}>Upgrade</Text>
                    </Pressable>
                  )}
                </View>

                {error && (
                  <View style={styles.errorCard}>
                    <MaterialIcons name="error-outline" size={20} color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>

        {/* Fixed bottom bar — outside ScrollView so it stays pinned */}
        {showRecipe && (
          <View style={[styles.bottomBar, { paddingBottom: safeBottom || spacing.lg }]}>
            <View style={styles.bottomButtonRow}>
              <Button
                title={inGroceryList ? 'Added to List' : 'Add to List'}
                icon={inGroceryList ? 'check' : 'add-shopping-cart'}
                onPress={handleToggleGroceryList}
                variant={inGroceryList ? 'secondary' : 'primary'}
                flex
              />
              <Button
                title="Instacart"
                icon="open-in-new"
                onPress={handleInstacart}
                variant="secondary"
                loading={instacartLoading}
                flex
              />
            </View>
          </View>
        )}
      </View>
    </>
  );
}

const f = typography.family;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  scrollContentExtracting: {
    flex: 1,
  },

  // ── Top Bar ──────────────────────────────────────────
  topBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },

  // ── Options Menu ───────────────────────────────────
  menuOverlay: {
    flex: 1,
  },
  menuDropdown: {
    position: 'absolute',
    right: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    minWidth: 180,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuItemTextDestructive: {
    fontSize: typography.size.base,
    fontFamily: f.bodyMedium,
    color: colors.deleteText,
  },

  // ── Hero ─────────────────────────────────────────────
  heroContainer: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    backgroundColor: colors.borderLight,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  // ── Content ──────────────────────────────────────────
  contentArea: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
  },
  contentAreaExtracting: {
    flex: 1,
  },
  title: {
    fontSize: typography.size['5xl'],
    fontFamily: f.headingBold,
    fontVariant: ['no-common-ligatures'],
    color: colors.text,
    lineHeight: 34,
    marginBottom: spacing.xs,
  },
  titleSkeleton: {
    width: '75%',
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.borderLight,
    marginBottom: spacing.sm,
  },
  channelName: {
    fontSize: typography.size.base,
    fontFamily: f.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  channelSkeleton: {
    width: '40%',
    height: 16,
    borderRadius: radius.sm,
    backgroundColor: colors.borderLight,
    marginBottom: spacing.xl,
  },

  // ── Quota card ───────────────────────────────────────
  quotaCard: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
  },
  quotaText: {
    flex: 1,
    fontSize: typography.size.sm,
    fontFamily: f.bodyMedium,
    color: colors.primary,
  },
  upgradeLink: {
    fontSize: typography.size.sm,
    fontFamily: f.bodySemibold,
    color: colors.primary,
    textDecorationLine: 'underline',
  },

  // ── Error card ───────────────────────────────────────
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.errorLight,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.error,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  errorText: {
    flex: 1,
    fontSize: typography.size.base,
    fontFamily: f.bodyMedium,
    color: colors.error,
  },

  // ── Recipe detail styles ────────────────────────────

  // Info Card
  infoCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
  },
  infoItem: {
    alignItems: 'center',
    width: '33.33%',
    paddingVertical: spacing.sm,
    gap: 2,
  },
  infoValue: {
    fontSize: typography.size.base,
    fontFamily: f.bodySemibold,
    color: colors.text,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: typography.size.xs,
    fontFamily: f.body,
    color: colors.textSecondary,
  },

  // Allergen notice
  allergenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.allergenBg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xl,
  },
  allergenRowText: {
    fontSize: typography.size.sm,
    fontFamily: f.body,
    color: colors.allergenText,
    flex: 1,
  },

  // Highlights
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  highlightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 7,
  },
  highlightText: {
    flex: 1,
    fontSize: typography.size.base,
    fontFamily: f.body,
    color: colors.text,
    lineHeight: 20,
  },

  // Section pattern
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  sectionTitle: {
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
  sectionBody: {
    gap: 0,
  },

  // Ingredients
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  ingredientBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginRight: spacing.md,
    marginTop: 8,
  },
  ingredientContent: {
    flex: 1,
  },
  ingredientQuantity: {
    fontSize: typography.size.sm,
    fontFamily: f.bodySemibold,
    color: colors.textSecondary,
    padding: 0,
  },
  ingredientName: {
    fontSize: typography.size.base,
    fontFamily: f.body,
    color: colors.text,
    padding: 0,
  },

  // Instructions
  instructionRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: typography.size.sm,
    fontFamily: f.bodyBold,
    color: colors.textOnPrimary,
  },
  instructionText: {
    flex: 1,
    fontSize: typography.size.base,
    fontFamily: f.body,
    color: colors.text,
    lineHeight: 22,
    padding: 0,
  },

  // Source video card
  videoCard: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card,
  },
  videoThumb: {
    width: 130,
    height: 90,
  },
  videoInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
    gap: 3,
  },
  videoTitle: {
    fontSize: typography.size.md,
    fontFamily: f.bodySemibold,
    color: colors.text,
  },
  videoChannel: {
    fontSize: typography.size.sm,
    fontFamily: f.body,
    color: colors.textSecondary,
  },
  videoLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  videoLink: {
    fontSize: typography.size.sm,
    fontFamily: f.bodySemibold,
    color: colors.primary,
  },

  // Companions
  companionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.md,
  },
  bottomButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  // Disclaimer
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xxl,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  disclaimerText: {
    flex: 1,
    fontSize: typography.size.xs,
    fontFamily: f.body,
    color: colors.textMuted,
    lineHeight: 16,
  },
});
