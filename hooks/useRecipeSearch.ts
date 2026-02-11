import { useState, useCallback, useEffect, useRef } from 'react';
import { Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { TextInput } from 'react-native';

import { useSubscription } from '@/contexts/SubscriptionContext';
import { getRandomTrending, type TrendingSearch } from '@/constants/trending';
import type { ExtractionPhase, VideoSearchResult } from '@/lib/types';
import {
  extractVideoId,
  getThumbnailUrl,
  searchRecipeVideos,
  fetchVideoDetails,
  extractIngredients,
} from '@/lib/api';
import { insertRecipe, findRecipeByVideoId } from '@/lib/storage';

// ── Types ────────────────────────────────────────────────────────

export type DietFilter = 'all' | 'veg' | 'nonveg' | 'vegan';

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
  dietFilter: DietFilter;
  setDietFilter: React.Dispatch<React.SetStateAction<DietFilter>>;
  inputRef: React.RefObject<TextInput>;

  // Computed
  trendingSearches: TrendingSearch[];
  showIdle: boolean;

  // Handlers
  handleSearch: (searchQuery?: string) => Promise<void>;
  handleExtract: (videoId: string) => Promise<void>;
  handleSelectVideo: (result: VideoSearchResult) => void;
  handleSuggestionPress: (suggestionQuery: string) => void;

  // Navigation
  router: ReturnType<typeof useRouter>;

  // Utilities
  getThumbnailUrl: typeof getThumbnailUrl;
}

// ── Hook ─────────────────────────────────────────────────────────

export function useRecipeSearch(): UseRecipeSearchReturn {
  const router = useRouter();
  const { tryExtract, showPaywall, weeklyLimit, isPro } = useSubscription();
  const params = useLocalSearchParams<{ search?: string; url?: string; _t?: string }>();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VideoSearchResult[]>([]);
  const [phase, setPhase] = useState<ExtractionPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const lastSearchKey = useRef<string | null>(null);
  const lastUrlKey = useRef<string | null>(null);
  const [dietFilter, setDietFilter] = useState<DietFilter>('all');

  // Trending searches for idle-state suggestions
  const [trendingSearches] = useState<TrendingSearch[]>(() => getRandomTrending(6));

  // Handle search param from other screens (e.g. Discover tab)
  useEffect(() => {
    const key = params._t ? `${params.search}_${params._t}` : params.search;
    if (params.search && key !== lastSearchKey.current) {
      lastSearchKey.current = key ?? null;
      setQuery(params.search);
      handleSearch(params.search);
    }
  }, [params.search, params._t]);

  // Handle URL param from share intent or Discover tab
  useEffect(() => {
    const key = params._t ? `${params.url}_${params._t}` : params.url;
    if (params.url && key !== lastUrlKey.current) {
      lastUrlKey.current = key ?? null;
      const videoId = extractVideoId(params.url);
      if (videoId) {
        setQuery(params.url);
        handleExtract(videoId);
      }
    }
  }, [params.url, params._t]);

  // ── Handlers ──

  const handleSearch = useCallback(
    async (searchQuery?: string) => {
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
        const dietSuffix =
          dietFilter === 'veg'
            ? ' vegetarian recipe'
            : dietFilter === 'vegan'
              ? ' vegan recipe'
              : dietFilter === 'nonveg'
                ? ' non-veg recipe'
                : '';
        const effectiveQuery = trimmed + dietSuffix;
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
    },
    [query, dietFilter],
  );

  const handleExtract = useCallback(
    async (videoId: string) => {
      setError(null);
      setSearchResults([]);

      const existing = await findRecipeByVideoId(videoId);
      if (existing) {
        router.push(`/recipe/${existing.id}`);
        return;
      }

      // Check extraction limit
      const allowed = await tryExtract();
      if (!allowed) {
        const purchased = await showPaywall();
        if (!purchased) {
          setError(
            `You've reached your weekly limit of ${weeklyLimit} recipes. Upgrade to Pro for ${isPro ? 'more' : '10'} recipes per week.`,
          );
          return;
        }
        const retryAllowed = await tryExtract();
        if (!retryAllowed) {
          setError("You've reached your weekly recipe limit. Please try again next week.");
          return;
        }
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

        setTimeout(() => {
          setPhase('idle');
          router.push(`/recipe/${id}`);
        }, 800);
      } catch (err) {
        setPhase('idle');
        setError(err instanceof Error ? err.message : 'Extraction failed');
      }
    },
    [router, tryExtract, showPaywall, weeklyLimit, isPro],
  );

  const handleSelectVideo = useCallback(
    (result: VideoSearchResult) => {
      handleExtract(result.videoId);
    },
    [handleExtract],
  );

  const handleSuggestionPress = useCallback(
    (suggestionQuery: string) => {
      setQuery(suggestionQuery);
      handleSearch(suggestionQuery);
    },
    [handleSearch],
  );

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
    dietFilter,
    setDietFilter,
    inputRef,

    // Computed
    trendingSearches,
    showIdle,

    // Handlers
    handleSearch,
    handleExtract,
    handleSelectVideo,
    handleSuggestionPress,

    // Navigation
    router,

    // Utilities
    getThumbnailUrl,
  };
}
