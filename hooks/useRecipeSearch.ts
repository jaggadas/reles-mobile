import { useState, useCallback, useEffect, useRef } from 'react';
import { Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { TextInput } from 'react-native';

import type { VideoSearchResult } from '@/lib/types';
import {
  extractVideoId,
  getThumbnailUrl,
  searchRecipeVideos,
} from '@/lib/api';

// ── Return type ──────────────────────────────────────────────────

export interface UseRecipeSearchReturn {
  // State
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  searchResults: VideoSearchResult[];
  setSearchResults: React.Dispatch<React.SetStateAction<VideoSearchResult[]>>;
  error: string | null;
  isSearching: boolean;
  inputRef: React.RefObject<TextInput | null>;

  // Computed
  showIdle: boolean;

  // Handlers
  handleSearch: (searchQuery?: string) => Promise<void>;
  handleSelectVideo: (result: VideoSearchResult) => void;

  // Navigation
  router: ReturnType<typeof useRouter>;

  // Utilities
  getThumbnailUrl: typeof getThumbnailUrl;
}

// ── Hook ─────────────────────────────────────────────────────────

export function useRecipeSearch(): UseRecipeSearchReturn {
  const router = useRouter();
  const params = useLocalSearchParams<{ search?: string; url?: string; _t?: string }>();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VideoSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const lastSearchKey = useRef<string | null>(null);
  const lastUrlKey = useRef<string | null>(null);
  const skipNextDebounce = useRef(false);

  // Handle search param from other screens (e.g. Discover tab)
  useEffect(() => {
    const key = params._t ? `${params.search}_${params._t}` : params.search;
    if (params.search && key !== lastSearchKey.current) {
      lastSearchKey.current = key ?? null;
      skipNextDebounce.current = true;
      setQuery(params.search);
      handleSearch(params.search);
    }
  }, [params.search, params._t]);

  // Handle URL param — navigate to preview instead of extracting
  useEffect(() => {
    const key = params._t ? `${params.url}_${params._t}` : params.url;
    if (params.url && key !== lastUrlKey.current) {
      lastUrlKey.current = key ?? null;
      skipNextDebounce.current = true;
      const videoId = extractVideoId(params.url);
      if (videoId) {
        router.push({
          pathname: '/recipe/preview',
          params: { videoId },
        } as any);
      }
    }
  }, [params.url, params._t]);

  // Debounced auto-search as user types
  useEffect(() => {
    if (skipNextDebounce.current) {
      skipNextDebounce.current = false;
      return;
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      setError(null);
      return;
    }

    // Don't auto-search YouTube URLs — those are handled on submit
    if (extractVideoId(trimmed)) return;

    // Require at least 3 characters before auto-searching
    if (trimmed.length < 3) return;

    const timer = setTimeout(() => {
      handleSearch(trimmed);
    }, 1000);

    return () => clearTimeout(timer);
  }, [query]);

  // ── Handlers ──

  const handleSearch = useCallback(
    async (searchQuery?: string) => {
      const trimmed = (searchQuery ?? query).trim();
      if (!trimmed) return;

      setError(null);
      setSearchResults([]);

      const videoId = extractVideoId(trimmed);
      if (videoId) {
        Keyboard.dismiss();
        router.push({
          pathname: '/recipe/preview',
          params: { videoId },
        } as any);
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
    },
    [query, router],
  );

  const handleSelectVideo = useCallback(
    (result: VideoSearchResult) => {
      router.push({
        pathname: '/recipe/preview',
        params: {
          videoId: result.videoId,
          title: result.title,
          channelName: result.channelName,
          thumbnail: result.thumbnail,
        },
      } as any);
    },
    [router],
  );

  const showIdle = !isSearching && searchResults.length === 0 && !error;

  return {
    // State
    query,
    setQuery,
    searchResults,
    setSearchResults,
    error,
    isSearching,
    inputRef,

    // Computed
    showIdle,

    // Handlers
    handleSearch,
    handleSelectVideo,

    // Navigation
    router,

    // Utilities
    getThumbnailUrl,
  };
}
