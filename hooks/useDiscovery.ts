import { useState, useMemo, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { CUISINE_CARDS } from '@/constants/cuisines';
import { EXPLORE_CATEGORIES } from '@/constants/explore-categories';
import { getSuggestionsForCuisines, type DishSuggestion } from '@/constants/suggestions';
import type { Recipe } from '@/lib/types';
import type { UserPreferences } from '@/lib/auth-types';
import {
  fetchHomeFeed,
  getThumbnailUrl,
  type HomeFeedResponse,
  type FeedRecipe,
  type VideoSearchResult,
} from '@/lib/api';
import { apiGetSavedRecipes } from '@/lib/api';

// ── Types ────────────────────────────────────────────────────

export interface QuickActionChip {
  label: string;
  query: string;
  emoji: string;
}

export interface AccompanyingSuggestion {
  label: string;
  query: string;
  sourceRecipeTitle: string;
  sourceRecipeThumbnail?: string;
}

export interface MoodCategory {
  id: string;
  label: string;
  emoji: string;
  query: string;
}

// ── Helpers ──────────────────────────────────────────────────

function getGreeting(name: string): { greeting: string; subtitle: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12)
    return { greeting: `Good morning, ${name}`, subtitle: 'What should we cook today?' };
  if (hour >= 12 && hour < 17)
    return { greeting: `Good afternoon, ${name}`, subtitle: 'Looking for lunch ideas?' };
  if (hour >= 17 && hour < 22)
    return { greeting: `Good evening, ${name}`, subtitle: 'Time to make something delicious' };
  return { greeting: `Late night cooking, ${name}?`, subtitle: "Let's find a midnight snack" };
}

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

function getDietaryString(prefs: UserPreferences | null): string {
  if (!prefs) return 'none';
  if (prefs.dietaryRestrictions.isVegan) return 'vegan';
  if (prefs.dietaryRestrictions.isVegetarian) return 'vegetarian';
  return 'none';
}

function getCuisineEmoji(category: string): string {
  return CUISINE_CARDS.find((c) => c.category === category)?.emoji || '🍴';
}

function getCuisineName(category: string): string {
  return (
    CUISINE_CARDS.find((c) => c.category === category)?.name ||
    category.charAt(0) + category.slice(1).toLowerCase().replace(/_/g, ' ')
  );
}

// ── Section 1: Quick Action Chips ────────────────────────────

function buildQuickActionChips(
  cuisines: string[],
  dietary: string,
  timeOfDay: string,
): QuickActionChip[] {
  const chips: QuickActionChip[] = [];
  const dietLabel = dietary === 'vegan' ? 'Vegan ' : dietary === 'vegetarian' ? 'Veggie ' : '';
  const dietQuery = dietary === 'vegan' ? 'vegan ' : dietary === 'vegetarian' ? 'vegetarian ' : '';

  // Time-based chips
  if (timeOfDay === 'morning') {
    chips.push({
      label: `${dietLabel}Breakfast`,
      query: `${dietQuery}breakfast`,
      emoji: '🥞',
    });
  } else if (timeOfDay === 'afternoon') {
    chips.push({
      label: `Quick ${dietLabel}Lunch`,
      query: `quick ${dietQuery}lunch`,
      emoji: '🥗',
    });
  } else {
    chips.push({
      label: `Quick ${dietLabel}Dinner`,
      query: `quick ${dietQuery}dinner`,
      emoji: '🍽️',
    });
  }

  // Cuisine-based chips
  for (const cuisine of cuisines.slice(0, 2)) {
    const name = getCuisineName(cuisine);
    const emoji = getCuisineEmoji(cuisine);
    if (timeOfDay === 'evening' || timeOfDay === 'night') {
      chips.push({
        label: `30-min ${name}`,
        query: `easy 30 minute ${name.toLowerCase()}`,
        emoji,
      });
    } else {
      chips.push({
        label: `Easy ${name}`,
        query: `easy ${name.toLowerCase()}`,
        emoji,
      });
    }
  }

  return chips.slice(0, 4);
}

// ── Section 5: Continue Your Cooking Journey ─────────────────

function buildAccompanyingSuggestions(recipes: Recipe[]): AccompanyingSuggestion[] {
  const suggestions: AccompanyingSuggestion[] = [];
  const seen = new Set<string>();

  for (const recipe of recipes.slice(0, 10)) {
    if (!recipe.accompanyingRecipes?.length) continue;
    for (const accompanying of recipe.accompanyingRecipes) {
      const key = accompanying.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      suggestions.push({
        label: accompanying,
        query: `${accompanying} recipe`,
        sourceRecipeTitle: recipe.title,
        sourceRecipeThumbnail: recipe.thumbnail,
      });
    }
    if (suggestions.length >= 6) break;
  }

  return suggestions;
}

// ── Section 8: Dietary-aware mood categories ─────────────────

function buildMoodCategories(dietary: string): MoodCategory[] {
  return EXPLORE_CATEGORIES.map((cat) => ({
    id: cat.id,
    label: cat.label,
    emoji: cat.emoji,
    query:
      dietary !== 'none'
        ? `${dietary} ${cat.query}`
        : cat.query,
  }));
}

// ── Hook ─────────────────────────────────────────────────────

export function useDiscovery() {
  const router = useRouter();
  const { user } = useAuth();

  const prefs = user?.preferences || null;
  const cuisines = prefs?.likedCuisines || [];
  const dietary = getDietaryString(prefs);
  const allergens = prefs?.allergens || [];

  // Server feed state
  const [feedData, setFeedData] = useState<HomeFeedResponse | null>(null);
  const [feedLoading, setFeedLoading] = useState(true);

  // Local recipes state
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  // ── Section 1: Greeting + Quick Action Chips ───────────────

  const greetingData = useMemo(
    () => getGreeting(user?.name?.split(' ')[0] || 'Chef'),
    [user?.name],
  );

  const timeOfDay = useMemo(() => getTimeOfDay(), []);

  const quickActionChips = useMemo(
    () => buildQuickActionChips(cuisines, dietary, timeOfDay),
    [cuisines.join(','), dietary, timeOfDay],
  );

  // ── Section 2: Picked For You (from server) ───────────────

  const pickedForYouVideos = useMemo<VideoSearchResult[]>(
    () => feedData?.pickedForYou || [],
    [feedData],
  );

  // ── Section 3: Trending in [Cuisine] (from server) ────────

  const trendingSection = useMemo(
    () => feedData?.trending || { cuisine: null, recipes: [] as FeedRecipe[] },
    [feedData],
  );

  // ── Section 4: Quick Tonight (from server) ─────────────────

  const quickTonightRecipes = useMemo<FeedRecipe[]>(
    () => feedData?.quickTonight || [],
    [feedData],
  );

  // ── Section 5: Continue Your Journey (client-side) ─────────

  const accompanyingSuggestions = useMemo(
    () => buildAccompanyingSuggestions(savedRecipes),
    [savedRecipes],
  );

  // ── Section 6: Because You Love [Cuisine] (from server) ───

  const deepDiveSection = useMemo(
    () => feedData?.deepDive || { cuisine: null, recipes: [] as FeedRecipe[] },
    [feedData],
  );

  // ── Section 7: Ready for a Challenge? (from server) ────────

  const challengeRecipes = useMemo<FeedRecipe[]>(
    () => feedData?.challenge || [],
    [feedData],
  );

  // ── Section 8: Mood categories (client-side) ───────────────

  const moodCategories = useMemo(
    () => buildMoodCategories(dietary),
    [dietary],
  );

  // ── Existing: For You + Recently Saved ─────────────────────

  const forYouSuggestions = useMemo<DishSuggestion[]>(() => {
    if (!cuisines.length) return [];
    return getSuggestionsForCuisines(cuisines, 8);
  }, [cuisines.join(',')]);

  const recentRecipes = useMemo(() => savedRecipes.slice(0, 5), [savedRecipes]);

  // ── Data Loading ───────────────────────────────────────────

  useFocusEffect(
    useCallback(() => {
      // Load saved recipes from server
      apiGetSavedRecipes().then(setSavedRecipes);

      // Load server feed
      setFeedLoading(true);
      fetchHomeFeed(cuisines, dietary, allergens)
        .then(setFeedData)
        .catch((err) => {
          console.error('Feed fetch error:', err);
        })
        .finally(() => setFeedLoading(false));
    }, [cuisines.join(','), dietary, allergens.join(',')]),
  );

  // ── Navigation ─────────────────────────────────────────────

  const navigateToSearch = useCallback(
    (searchQuery: string) => {
      (router as any).navigate({
        pathname: '/(tabs)/search',
        params: { search: searchQuery, _t: String(Date.now()) },
      });
    },
    [router],
  );

  const navigateToPreview = useCallback(
    (videoId: string) => {
      router.push({
        pathname: '/recipe/preview',
        params: { videoId },
      } as any);
    },
    [router],
  );

  // ── Return ─────────────────────────────────────────────────

  return {
    // General
    greetingData,
    feedLoading,
    router,
    navigateToSearch,
    navigateToPreview,
    getThumbnailUrl,

    // Section 1
    quickActionChips,

    // Section 2
    pickedForYouVideos,

    // Section 3
    trendingSection,

    // Section 4
    quickTonightRecipes,

    // Section 5
    accompanyingSuggestions,

    // Section 6
    deepDiveSection,

    // Section 7
    challengeRecipes,

    // Section 8
    moodCategories,

    // Existing
    forYouSuggestions,
    recentRecipes,
    savedRecipes,

    // Helpers
    getCuisineEmoji,
    getCuisineName,
  };
}
