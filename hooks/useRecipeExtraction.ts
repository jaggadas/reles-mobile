import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';

import { useSubscription } from '@/contexts/SubscriptionContext';
import type { ExtractionPhase, ExtractedRecipe, Ingredient, Recipe } from '@/lib/types';
import {
  fetchVideoDetails,
  extractIngredientsStream,
  getThumbnailUrl,
} from '@/lib/api';
import { insertRecipe, findRecipeByVideoId, getRecipeById } from '@/lib/storage';

// ── Types ──────────────────────────────────────────────────────

export interface UseRecipeExtractionReturn {
  videoTitle: string | null;
  channelTitle: string | null;
  thumbnailUrl: string;
  metaLoading: boolean;

  phase: ExtractionPhase;
  error: string | null;

  startExtraction: () => Promise<void>;

  alreadySaved: boolean;
  existingRecipeId: string | null;

  /** The saved recipe data, available after extraction completes */
  savedRecipe: Recipe | null;

  /** Progressive streaming state — grows as data arrives */
  streamedIngredients: Ingredient[];
  streamedInstructions: string[];
  streamedMetadata: Record<string, unknown>;
}

// ── Hook ───────────────────────────────────────────────────────

export function useRecipeExtraction(
  videoId: string,
  initialTitle?: string,
  initialChannel?: string,
): UseRecipeExtractionReturn {
  const router = useRouter();
  const { tryExtract, showPaywall, remainingExtractions, weeklyLimit, isPro } = useSubscription();

  const [videoTitle, setVideoTitle] = useState<string | null>(initialTitle ?? null);
  const [channelTitle, setChannelTitle] = useState<string | null>(initialChannel ?? null);
  const [metaLoading, setMetaLoading] = useState(!initialTitle);

  const [phase, setPhase] = useState<ExtractionPhase>('idle');
  const [error, setError] = useState<string | null>(null);

  const [alreadySaved, setAlreadySaved] = useState(false);
  const [existingRecipeId, setExistingRecipeId] = useState<string | null>(null);
  const [savedRecipe, setSavedRecipe] = useState<Recipe | null>(null);

  // Streaming progressive state
  const [streamedIngredients, setStreamedIngredients] = useState<Ingredient[]>([]);
  const [streamedInstructions, setStreamedInstructions] = useState<string[]>([]);
  const [streamedMetadata, setStreamedMetadata] = useState<Record<string, unknown>>({});

  const thumbnailUrl = getThumbnailUrl(videoId);
  const cancelledRef = useRef(false);

  // Fetch metadata + check if already saved on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Check local storage for existing recipe
      const existing = await findRecipeByVideoId(videoId);
      if (existing && !cancelled) {
        setAlreadySaved(true);
        setExistingRecipeId(existing.id);
        if (!videoTitle) setVideoTitle(existing.title);
        if (!channelTitle) setChannelTitle(existing.channelTitle ?? null);
      }

      // Fetch fresh metadata from API
      if (!initialTitle) {
        try {
          const details = await fetchVideoDetails(videoId);
          if (!cancelled) {
            setVideoTitle(details.title);
            setChannelTitle(details.channelTitle);
          }
        } catch {
          // Non-fatal — we can still extract without pre-fetched metadata
        } finally {
          if (!cancelled) setMetaLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  // ── Extraction pipeline (streaming) ──

  const startExtraction = useCallback(async () => {
    if (alreadySaved && existingRecipeId) {
      router.push(`/recipe/${existingRecipeId}`);
      return;
    }

    setError(null);
    cancelledRef.current = false;

    // Reset streaming state
    setStreamedIngredients([]);
    setStreamedInstructions([]);
    setStreamedMetadata({});

    // Pre-check quota (read-only, no server call / no deduction)
    if (remainingExtractions <= 0) {
      const purchased = await showPaywall();
      if (!purchased) {
        setError(
          `You've reached your weekly limit of ${weeklyLimit} recipes. Upgrade to Pro for more.`,
        );
        return;
      }
    }

    try {
      setPhase('fetching');

      const result: { value: ExtractedRecipe | null } = { value: null };

      await extractIngredientsStream(videoId, {
        onPhase: (p) => {
          if (!cancelledRef.current) setPhase(p);
        },
        onMetadata: (fields) => {
          if (!cancelledRef.current) {
            setStreamedMetadata((prev) => ({ ...prev, ...fields }));
          }
        },
        onIngredient: (ingredient) => {
          if (!cancelledRef.current) {
            setStreamedIngredients((prev) => [...prev, ingredient]);
          }
        },
        onInstruction: (_index, text) => {
          if (!cancelledRef.current) {
            setStreamedInstructions((prev) => [...prev, text]);
          }
        },
        onComplete: (recipe) => {
          result.value = recipe;
        },
        onError: (message) => {
          if (!cancelledRef.current) {
            setPhase('idle');
            setError(message);
          }
        },
      });

      const extracted = result.value;
      if (cancelledRef.current || !extracted) return;

      const id = await insertRecipe({
        videoId,
        title: extracted.title || videoTitle || 'Untitled Recipe',
        videoTitle: videoTitle || extracted.title,
        channelTitle: channelTitle || undefined,
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

      // Deduct quota only after successful extraction + save
      try {
        await tryExtract();
      } catch {
        // Deduction failed but recipe is saved — don't block the user
      }

      // Load the full recipe and show it inline
      const recipe = await getRecipeById(id);
      if (!cancelledRef.current) {
        setPhase('idle');
        setSavedRecipe(recipe);
        setAlreadySaved(true);
        setExistingRecipeId(id);
      }
    } catch (err) {
      if (!cancelledRef.current) {
        setPhase('idle');
        setError(err instanceof Error ? err.message : 'Extraction failed');
      }
    }
  }, [videoId, videoTitle, channelTitle, alreadySaved, existingRecipeId, router, tryExtract, showPaywall, remainingExtractions, weeklyLimit, isPro]);

  return {
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
  };
}
