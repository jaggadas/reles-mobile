import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { TextInput } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { getRandomTrending, type TrendingSearch } from '@/constants/trending';
import { getSuggestionsForCuisines, type DishSuggestion } from '@/constants/suggestions';
import { getCurrentSeason, type SeasonConfig } from '@/constants/seasonal';
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

// ── Return type ──────────────────────────────────────────────────

export interface UseRecipeSearchReturn {
  // State
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  searchResults: VideoSearchResult[];
  setSearchResults: React.Dispatch<React.SetStateAction<VideoSearchResult[]>>;
  phase: ExtractionPhase;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  isSearching: boolean;
  vegOnly: boolean;
  setVegOnly: React.Dispatch<React.SetStateAction<boolean>>;
  inputRef: React.RefObject<TextInput>;

  // Computed / memoized data
  greetingData: { greeting: string; subtitle: string };
  trendingSearches: TrendingSearch[];
  season: SeasonConfig;
  recipeOfTheDay: Recipe | null;
  recentRecipes: Recipe[];
  forYouSuggestions: DishSuggestion[];
  popularRecipes: PopularRecipe[];
  showIdle: boolean;

  // Handlers
  handleSearch: (searchQuery?: string) => Promise<void>;
  handleExtract: (videoId: string) => Promise<void>;
  handleSelectVideo: (result: VideoSearchResult) => void;
  handlePopularPress: (recipe: PopularRecipe) => void;
  handleCategoryPress: (categoryQuery: string) => void;

  // Navigation (exposed for UI that navigates directly)
  router: ReturnType<typeof useRouter>;

  // Re-exported for UI usage
  getThumbnailUrl: typeof getThumbnailUrl;
}

// ── Hook ─────────────────────────────────────────────────────────

export function useRecipeSearch(): UseRecipeSearchReturn {
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
  const [vegOnly, setVegOnly] = useState(false);

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
      const effectiveQuery = vegOnly ? `${trimmed} veg recipe` : trimmed;
      const results = await searchRecipeVideos(effectiveQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setError('No videos found. Try a different search.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [query, vegOnly]);

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

  return {
    // State
    query,
    setQuery,
    searchResults,
    setSearchResults,
    phase,
    error,
    setError,
    isSearching,
    vegOnly,
    setVegOnly,
    inputRef,

    // Computed / memoized data
    greetingData,
    trendingSearches,
    season,
    recipeOfTheDay,
    recentRecipes,
    forYouSuggestions,
    popularRecipes,
    showIdle,

    // Handlers
    handleSearch,
    handleExtract,
    handleSelectVideo,
    handlePopularPress,
    handleCategoryPress,

    // Navigation
    router,

    // Re-exported utilities
    getThumbnailUrl,
  };
}
