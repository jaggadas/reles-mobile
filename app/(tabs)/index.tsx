import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Keyboard,
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { ExtractionCard } from '@/components/ExtractionCard';
import { VideoSearchResults } from '@/components/VideoSearchResults';
import { EmptyState } from '@/components/ui';
import { EXPLORE_CATEGORIES } from '@/constants/explore-categories';
import { getRandomTrending, type TrendingSearch } from '@/constants/trending';
import { getSuggestionsForCuisines, type DishSuggestion } from '@/constants/suggestions';
import { getCurrentSeason } from '@/constants/seasonal';
import type { ExtractionPhase, VideoSearchResult, Recipe } from '@/lib/types';
import {
  extractVideoId,
  getThumbnailUrl,
  searchRecipeVideos,
  fetchVideoDetails,
  extractIngredients,
  fetchPopularRecipes,
  type PopularRecipe,
} from '@/lib/api';
import { insertRecipe, findRecipeByVideoId, getAllRecipes } from '@/lib/storage';
import { formatCuisine } from '@/lib/format';

// ── Helpers ──────────────────────────────────────────────────────

function getGreeting(name: string): { greeting: string; subtitle: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { greeting: `Good morning, ${name}`, subtitle: "What should we cook today?" };
  if (hour >= 12 && hour < 17) return { greeting: `Good afternoon, ${name}`, subtitle: "Looking for lunch ideas?" };
  if (hour >= 17 && hour < 22) return { greeting: `Good evening, ${name}`, subtitle: "Time to make something delicious" };
  return { greeting: `Late night cooking, ${name}?`, subtitle: "Let's find a midnight snack" };
}

function getRecipeOfTheDay(recipes: Recipe[]): Recipe | null {
  if (recipes.length === 0) return null;
  const now = new Date();
  const hash = now.getDate() + now.getMonth() * 31 + now.getFullYear() * 366;
  return recipes[hash % recipes.length];
}

// ── Component ────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ search?: string; url?: string }>();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VideoSearchResult[]>([]);
  const [phase, setPhase] = useState<ExtractionPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [popularRecipes, setPopularRecipes] = useState<PopularRecipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const inputRef = useRef<TextInput>(null);
  const lastSearchParam = useRef<string | null>(null);
  const lastUrlParam = useRef<string | null>(null);

  // Memoized data
  const [trendingSearches] = useState<TrendingSearch[]>(() => getRandomTrending(6));
  const season = useMemo(() => getCurrentSeason(), []);
  const greetingData = useMemo(
    () => getGreeting(user?.name?.split(' ')[0] || 'Chef'),
    [user?.name],
  );
  const recipeOfTheDay = useMemo(() => getRecipeOfTheDay(savedRecipes), [savedRecipes]);
  const recentRecipes = useMemo(() => savedRecipes.slice(0, 5), [savedRecipes]);
  const forYouSuggestions = useMemo<DishSuggestion[]>(() => {
    if (!user?.preferences?.likedCuisines?.length) return [];
    return getSuggestionsForCuisines(user.preferences.likedCuisines, 8);
  }, [user?.preferences?.likedCuisines]);

  // ── Theme colors ──
  const bgColor = useThemeColor(
    { light: colors.light.background, dark: colors.dark.background },
    'background',
  );
  const textColor = useThemeColor(
    { light: colors.light.text, dark: colors.dark.text },
    'text',
  );
  const subtextColor = useThemeColor(
    { light: colors.light.textSecondary, dark: colors.dark.textSecondary },
    'text',
  );
  const inputBg = useThemeColor(
    { light: colors.light.inputBackground, dark: colors.dark.inputBackground },
    'background',
  );
  const placeholderColor = useThemeColor(
    { light: colors.light.textMuted, dark: colors.dark.textMuted },
    'text',
  );
  const primaryColor = useThemeColor(
    { light: colors.light.primary, dark: colors.dark.primary },
    'tint',
  );
  const primaryTextColor = useThemeColor(
    { light: colors.light.textOnPrimary, dark: colors.dark.textOnPrimary },
    'text',
  );
  const primaryLightColor = useThemeColor(
    { light: colors.light.primaryLight, dark: colors.dark.primaryLight },
    'background',
  );
  const cardBg = useThemeColor(
    { light: colors.light.card, dark: colors.dark.card },
    'background',
  );
  const accentColor = useThemeColor(
    { light: colors.light.accent, dark: colors.dark.accent },
    'tint',
  );
  const categoryBg = useThemeColor(
    { light: colors.light.categoryBg, dark: colors.dark.categoryBg },
    'background',
  );
  const borderColor = useThemeColor(
    { light: colors.light.borderLight, dark: colors.dark.borderLight },
    'text',
  );

  // ── Data loading ──
  useEffect(() => {
    fetchPopularRecipes(5).then(setPopularRecipes);
    getAllRecipes().then(setSavedRecipes);
  }, []);

  // Handle search param from other screens
  useEffect(() => {
    if (params.search && params.search !== lastSearchParam.current) {
      lastSearchParam.current = params.search;
      setQuery(params.search);
      handleSearch(params.search);
    }
  }, [params.search]);

  // Handle URL param from share intent
  useEffect(() => {
    if (params.url && params.url !== lastUrlParam.current) {
      lastUrlParam.current = params.url;
      const videoId = extractVideoId(params.url);
      if (videoId) {
        setQuery(params.url);
        handleExtract(videoId);
      }
    }
  }, [params.url]);

  // ── Handlers ──
  const handleSearch = useCallback(async (searchQuery?: string) => {
    const trimmed = (searchQuery ?? query).trim();
    if (!trimmed) return;

    Keyboard.dismiss();
    setError(null);
    setSearchResults([]);

    const videoId = extractVideoId(trimmed);
    if (videoId) {
      await handleExtract(videoId);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchRecipeVideos(trimmed);
      setSearchResults(results);
      if (results.length === 0) {
        setError('No videos found. Try a different search.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const handleExtract = useCallback(async (videoId: string) => {
    setError(null);
    setSearchResults([]);

    const existing = await findRecipeByVideoId(videoId);
    if (existing) {
      router.push(`/recipe/${existing.id}`);
      return;
    }

    try {
      setPhase('fetching');
      const details = await fetchVideoDetails(videoId);

      setPhase('extracting');
      const extracted = await extractIngredients(videoId);

      setPhase('success');

      const id = await insertRecipe({
        videoId,
        title: extracted.title || details.title,
        videoTitle: details.title,
        channelTitle: details.channelTitle,
        thumbnail: getThumbnailUrl(videoId),
        url: `https://www.youtube.com/watch?v=${videoId}`,
        ingredients: extracted.ingredients,
        instructions: extracted.instructions,
        servings: extracted.servings,
        prepTimeMinutes: extracted.prepTimeMinutes,
        cookTimeMinutes: extracted.cookTimeMinutes,
        allergens: extracted.allergens,
        caloriesKcal: extracted.caloriesKcal,
        difficulty: extracted.difficulty,
        cuisine: extracted.cuisine,
        accompanyingRecipes: extracted.accompanyingRecipes,
      });

      // Refresh saved recipes
      getAllRecipes().then(setSavedRecipes);

      setTimeout(() => {
        setPhase('idle');
        router.push(`/recipe/${id}`);
      }, 800);
    } catch (err) {
      setPhase('idle');
      setError(err instanceof Error ? err.message : 'Extraction failed');
    }
  }, [router]);

  const handleSelectVideo = useCallback((result: VideoSearchResult) => {
    handleExtract(result.videoId);
  }, [handleExtract]);

  const handlePopularPress = useCallback((recipe: PopularRecipe) => {
    handleExtract(recipe.videoId);
  }, [handleExtract]);

  const handleCategoryPress = useCallback((categoryQuery: string) => {
    setQuery(categoryQuery);
    handleSearch(categoryQuery);
  }, [handleSearch]);

  const showIdle = !isSearching && searchResults.length === 0 && phase === 'idle' && !error;

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={[styles.greetingText, { color: textColor }]}>
          {greetingData.greeting}
        </Text>
        <Text style={[styles.greetingSubtext, { color: subtextColor }]}>
          {greetingData.subtitle}
        </Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: borderColor as string }]}>
          <MaterialIcons name="search" size={20} color={placeholderColor as string} />
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: textColor }]}
            placeholder="Paste URL or search recipes..."
            placeholderTextColor={placeholderColor as string}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); setSearchResults([]); setError(null); }}>
              <MaterialIcons name="close" size={20} color={placeholderColor as string} />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={() => handleSearch()}
          style={[styles.searchButton, { backgroundColor: primaryColor }]}
        >
          <MaterialIcons name="arrow-forward" size={20} color={primaryTextColor as string} />
        </Pressable>
      </View>

      {/* Trending searches (only when idle) */}
      {showIdle && (
        <View style={styles.trendingContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
            <MaterialIcons name="trending-up" size={16} color={subtextColor as string} style={{ marginRight: 6 }} />
            {trendingSearches.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => handleCategoryPress(item.query)}
                style={({ pressed }) => [
                  styles.trendingChip,
                  {
                    backgroundColor: categoryBg as string,
                    borderColor: borderColor as string,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[styles.trendingLabel, { color: subtextColor }]}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Loading state */}
      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor as string} />
          <Text style={[styles.loadingText, { color: subtextColor }]}>Searching recipes...</Text>
        </View>
      )}

      {/* Extraction card */}
      <ExtractionCard phase={phase} error={error} />

      {/* Search results */}
      {searchResults.length > 0 && phase === 'idle' && (
        <VideoSearchResults results={searchResults} onSelect={handleSelectVideo} />
      )}

      {/* Idle state: all sections */}
      {showIdle && (
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Recipe of the Day */}
          {recipeOfTheDay && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="auto-awesome" size={20} color={primaryColor as string} />
                <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 0 }]}>
                  Recipe of the Day
                </Text>
              </View>
              <Pressable
                onPress={() => router.push(`/recipe/${recipeOfTheDay.id}`)}
                style={({ pressed }) => [
                  styles.heroCard,
                  { backgroundColor: cardBg, transform: [{ scale: pressed ? 0.98 : 1 }] },
                ]}
              >
                <Image
                  source={{ uri: recipeOfTheDay.thumbnail }}
                  style={styles.heroImage}
                />
                <View style={styles.heroContent}>
                  <Text style={[styles.heroTitle, { color: textColor }]} numberOfLines={2}>
                    {recipeOfTheDay.title}
                  </Text>
                  <View style={styles.heroMeta}>
                    {recipeOfTheDay.cuisine && recipeOfTheDay.cuisine !== 'OTHER' && (
                      <View style={[styles.heroBadge, { backgroundColor: primaryLightColor as string }]}>
                        <Text style={[styles.heroBadgeText, { color: primaryColor }]}>
                          {formatCuisine(recipeOfTheDay.cuisine)}
                        </Text>
                      </View>
                    )}
                    {recipeOfTheDay.cookTimeMinutes && (
                      <View style={styles.heroTime}>
                        <MaterialIcons name="schedule" size={14} color={subtextColor as string} />
                        <Text style={[styles.heroTimeText, { color: subtextColor }]}>
                          {recipeOfTheDay.cookTimeMinutes} min
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            </View>
          )}

          {/* Recently Extracted */}
          {recentRecipes.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Recently Extracted
              </Text>
              <FlatList
                data={recentRecipes}
                horizontal
                scrollEnabled
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.horizontalList}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => router.push(`/recipe/${item.id}`)}
                    style={({ pressed }) => [
                      styles.recentCard,
                      { backgroundColor: cardBg, transform: [{ scale: pressed ? 0.97 : 1 }] },
                    ]}
                  >
                    <Image
                      source={{ uri: item.thumbnail }}
                      style={styles.recentThumbnail}
                    />
                    <Text
                      style={[styles.recentTitle, { color: textColor }]}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          )}

          {/* For You */}
          {forYouSuggestions.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="favorite" size={20} color={primaryColor as string} />
                <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 0 }]}>
                  For You
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              >
                {forYouSuggestions.map((item) => (
                  <Pressable
                    key={item.label}
                    onPress={() => handleCategoryPress(item.query)}
                    style={({ pressed }) => [
                      styles.suggestionChip,
                      {
                        backgroundColor: primaryLightColor as string,
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                      },
                    ]}
                  >
                    <Text style={styles.suggestionEmoji}>{item.emoji}</Text>
                    <Text style={[styles.suggestionLabel, { color: primaryColor }]}>
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* What are you feeling? */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              What are you feeling?
            </Text>
            <View style={styles.categoryGrid}>
              {EXPLORE_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => handleCategoryPress(cat.query)}
                  style={({ pressed }) => [
                    styles.categoryCard,
                    {
                      backgroundColor: categoryBg as string,
                      borderColor: borderColor as string,
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    },
                  ]}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.categoryLabel, { color: textColor }]}>
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Seasonal Picks */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.seasonEmoji}>{season.emoji}</Text>
              <View>
                <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 0 }]}>
                  {season.name} Picks
                </Text>
                <Text style={[styles.seasonSubtitle, { color: subtextColor }]}>
                  {season.subtitle}
                </Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {season.items.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => handleCategoryPress(item.query)}
                  style={({ pressed }) => [
                    styles.seasonalCard,
                    {
                      backgroundColor: categoryBg as string,
                      borderColor: borderColor as string,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    },
                  ]}
                >
                  <Text style={styles.seasonalEmoji}>{item.emoji}</Text>
                  <Text style={[styles.seasonalLabel, { color: textColor }]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Today's Top Recipes */}
          {popularRecipes.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="local-fire-department" size={22} color={accentColor as string} />
                <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 0 }]}>
                  Today's Top Recipes
                </Text>
              </View>
              <FlatList
                data={popularRecipes}
                horizontal
                scrollEnabled
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.videoId}
                contentContainerStyle={styles.horizontalList}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handlePopularPress(item)}
                    style={({ pressed }) => [
                      styles.popularCard,
                      { backgroundColor: cardBg, transform: [{ scale: pressed ? 0.97 : 1 }] },
                    ]}
                  >
                    <Image
                      source={{ uri: getThumbnailUrl(item.videoId) }}
                      style={styles.popularThumbnail}
                    />
                    <View style={styles.popularInfo}>
                      <Text
                        style={[styles.popularName, { color: textColor }]}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      <View style={styles.popularMeta}>
                        <MaterialIcons name="visibility" size={12} color={subtextColor as string} />
                        <Text style={[styles.popularCount, { color: subtextColor }]}>
                          {item.timesAccessed} {item.timesAccessed === 1 ? 'view' : 'views'}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                )}
              />
            </View>
          )}

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Greeting
  greetingContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  greetingText: {
    fontSize: typography.size['4xl'],
    fontWeight: typography.weight.bold,
    letterSpacing: -0.5,
  },
  greetingSubtext: {
    fontSize: typography.size.lg,
    marginTop: spacing.xs,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.size.lg,
    height: '100%',
  },
  searchButton: {
    borderRadius: radius.lg,
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Trending
  trendingContainer: {
    paddingBottom: spacing.sm,
  },
  trendingScroll: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  trendingChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  trendingLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.size.lg,
  },

  // Scroll
  scrollContent: {
    flex: 1,
  },

  // Sections
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },

  // Hero / Recipe of the Day
  heroCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  heroImage: {
    width: '100%',
    height: 180,
  },
  heroContent: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  heroTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    letterSpacing: -0.2,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  heroBadgeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  heroTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroTimeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },

  // Recent recipes
  recentCard: {
    width: 140,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  recentThumbnail: {
    width: 140,
    height: 80,
  },
  recentTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    padding: spacing.sm,
    lineHeight: 16,
  },

  // For You suggestions
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  suggestionEmoji: {
    fontSize: 18,
  },
  suggestionLabel: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },

  // Category grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  categoryCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryLabel: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
  },

  // Seasonal picks
  seasonEmoji: {
    fontSize: 22,
  },
  seasonSubtitle: {
    fontSize: typography.size.sm,
    marginTop: 2,
  },
  seasonalCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    minWidth: 110,
  },
  seasonalEmoji: {
    fontSize: 28,
  },
  seasonalLabel: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },

  // Horizontal lists
  horizontalList: {
    gap: spacing.md,
  },

  // Popular recipes
  popularCard: {
    width: 180,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  popularThumbnail: {
    width: 180,
    height: 100,
  },
  popularInfo: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  popularName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    lineHeight: 18,
  },
  popularMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  popularCount: {
    fontSize: typography.size.sm,
  },
});
