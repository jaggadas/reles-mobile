import { useState, useMemo, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { getSuggestionsForCuisines, type DishSuggestion } from '@/constants/suggestions';
import type { Recipe } from '@/lib/types';
import {
  fetchPopularRecipes,
  getThumbnailUrl,
  type PopularRecipe,
} from '@/lib/api';
import { getAllRecipes } from '@/lib/storage';

// ── Helpers ──────────────────────────────────────────────────────

function getGreeting(name: string): { greeting: string; subtitle: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { greeting: `Good morning, ${name}`, subtitle: 'What should we cook today?' };
  if (hour >= 12 && hour < 17) return { greeting: `Good afternoon, ${name}`, subtitle: 'Looking for lunch ideas?' };
  if (hour >= 17 && hour < 22) return { greeting: `Good evening, ${name}`, subtitle: 'Time to make something delicious' };
  return { greeting: `Late night cooking, ${name}?`, subtitle: "Let's find a midnight snack" };
}

// ── Hook ─────────────────────────────────────────────────────────

export function useDiscovery() {
  const router = useRouter();
  const { user } = useAuth();

  const [popularRecipes, setPopularRecipes] = useState<PopularRecipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  const greetingData = useMemo(
    () => getGreeting(user?.name?.split(' ')[0] || 'Chef'),
    [user?.name],
  );

  const heroRecipe = useMemo(() => popularRecipes[0] ?? null, [popularRecipes]);
  const topRecipes = useMemo(() => popularRecipes.slice(1), [popularRecipes]);
  const recentRecipes = useMemo(() => savedRecipes.slice(0, 5), [savedRecipes]);

  const forYouSuggestions = useMemo<DishSuggestion[]>(() => {
    if (!user?.preferences?.likedCuisines?.length) return [];
    return getSuggestionsForCuisines(user.preferences.likedCuisines, 8);
  }, [user?.preferences?.likedCuisines]);

  // Refresh data when the tab gains focus
  useFocusEffect(
    useCallback(() => {
      getAllRecipes().then(setSavedRecipes);
      fetchPopularRecipes(8).then(setPopularRecipes);
    }, []),
  );

  const navigateToSearch = useCallback(
    (searchQuery: string) => {
      (router as any).navigate({
        pathname: '/(tabs)/search',
        params: { search: searchQuery, _t: String(Date.now()) },
      });
    },
    [router],
  );

  const navigateToExtract = useCallback(
    (videoId: string) => {
      (router as any).navigate({
        pathname: '/(tabs)/search',
        params: { url: `https://www.youtube.com/watch?v=${videoId}`, _t: String(Date.now()) },
      });
    },
    [router],
  );

  return {
    greetingData,
    heroRecipe,
    topRecipes,
    recentRecipes,
    forYouSuggestions,
    navigateToSearch,
    navigateToExtract,
    getThumbnailUrl,
    router,
  };
}
