import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { colors, spacing, radius, typography, palette, shadows } from '@/constants/colors';
import { Button, Tag } from '@/components/ui';
import { formatDifficulty, formatCuisine, formatAllergens, formatTime } from '@/lib/format';
import { getThumbnailUrl } from '@/lib/api';
import { useRecipeDetail } from '@/hooks/useRecipeDetail';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HERO_HEIGHT = 140;

// ── Section Header (matches homepage pattern) ──────────────────
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

export default function RecipeDetailScreen() {
  const {
    recipe,
    title,
    setTitle,
    instacartLoading,
    relatedVideos,
    loadingRelated,
    intersectingAllergens,
    handleTitleBlur,
    handleInstacart,
    inGroceryList,
    handleToggleGroceryList,
    handleDelete,
    handleUpdateIngredient,
    handleUpdateInstruction,
    router,
  } = useRecipeDetail();

  const { top: safeTop, bottom: safeBottom } = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);

  if (!recipe) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  const heroUri = recipe.thumbnail || (recipe.videoId ? getThumbnailUrl(recipe.videoId) : null);

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

          <Pressable
            onPress={toggleMenu}
            style={styles.topBarButton}
            hitSlop={12}
          >
            <MaterialIcons name="more-vert" size={22} color={colors.text} />
          </Pressable>
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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero image */}
          {heroUri ? (
            <View style={styles.heroContainer}>
              <Image
                source={{ uri: heroUri }}
                style={styles.heroImage}
                contentFit="cover"
              />
              <View style={styles.heroGradient} />
            </View>
          ) : (
            <View style={[styles.heroPlaceholder, { paddingTop: safeTop + 56 }]} />
          )}

          {/* Content area */}
          <View style={styles.contentArea}>
            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Channel name */}
            {recipe.channelTitle ? (
              <Text style={styles.channelName}>by {recipe.channelTitle}</Text>
            ) : null}

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

            {/* Related videos */}
            {(loadingRelated || relatedVideos.length > 0) && (
              <View style={styles.section}>
                <SectionHeader title="More From Other Creators" />
                {loadingRelated && relatedVideos.length === 0 ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: spacing.md }} />
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.relatedScroll}
                  >
                    {relatedVideos.map((video) => (
                      <Pressable
                        key={video.videoId}
                        style={({ pressed }) => [
                          styles.relatedCard,
                          pressed && { opacity: 0.7 },
                        ]}
                        onPress={() =>
                          router.push({
                            pathname: '/recipe/preview',
                            params: {
                              videoId: video.videoId,
                              title: video.title,
                              channelName: video.channelName,
                              thumbnail: video.thumbnail,
                            },
                          } as any)
                        }
                      >
                        <Image
                          source={{ uri: video.thumbnail }}
                          style={styles.relatedThumb}
                          contentFit="cover"
                        />
                        <Text style={styles.relatedTitle} numberOfLines={2}>
                          {video.title}
                        </Text>
                        <Text style={styles.relatedChannel} numberOfLines={1}>
                          {video.channelName}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
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
                      onPress={() => router.navigate({ pathname: '/(tabs)', params: { search: name } })}
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
                This recipe was generated by AI from the video. Always cross-check details with the original source.
              </Text>
            </View>

            <View style={{ height: 100 }} />
          </View>
        </ScrollView>

        {/* Fixed bottom buttons */}
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
      </View>
    </>
  );
}

const f = typography.family;
const RELATED_CARD_WIDTH = (SCREEN_WIDTH - spacing.xl * 2 - spacing.lg) / 2;

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
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  // ── Top Bar ─────────────────────────────────────────
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
    backgroundColor: palette.gray100,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'transparent',
    // Simulated gradient with a fading overlay
    borderTopWidth: 0,
  },
  heroPlaceholder: {
    width: SCREEN_WIDTH,
    height: 20,
  },

  // ── Content ──────────────────────────────────────────
  contentArea: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
  },
  title: {
    fontSize: typography.size['5xl'],
    fontFamily: f.headingBold,
    fontVariant: ['no-common-ligatures'],
    color: colors.text,
    lineHeight: 34,
    padding: 0,
    marginBottom: spacing.xs,
  },
  channelName: {
    fontSize: typography.size.base,
    fontFamily: f.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },

  // ── Info Card ───────────────────────────────────────
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

  // ── Allergen notice ─────────────────────────────────
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

  // ── Section pattern (matches homepage) ───────────────
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

  // ── Highlights ───────────────────────────────────────
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

  // ── Ingredients ──────────────────────────────────────
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
  // ── Instructions ─────────────────────────────────────
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

  // ── Source video card ────────────────────────────────
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

  // ── Related videos ───────────────────────────────────
  relatedScroll: {
    paddingRight: spacing.xl,
    gap: spacing.lg,
  },
  relatedCard: {
    width: RELATED_CARD_WIDTH,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  relatedThumb: {
    width: '100%',
    height: 100,
  },
  relatedTitle: {
    fontSize: typography.size.sm,
    fontFamily: f.bodySemibold,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  relatedChannel: {
    fontSize: typography.size.xs,
    fontFamily: f.body,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    marginTop: 2,
  },

  // ── Companions ───────────────────────────────────────
  companionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  // ── Fixed bottom bar ────────────────────────────────
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
  },

  // ── Disclaimer ─────────────────────────────────────
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
