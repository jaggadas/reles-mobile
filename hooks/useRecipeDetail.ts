import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import type { Recipe, VideoSearchResult } from '@/lib/types';
import {
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  addRecipeToGroceryList,
  removeRecipeFromGroceryList,
  isRecipeInGroceryList,
} from '@/lib/storage';
import { createInstacartRecipeLink, searchRecipeVideos } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export function useRecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [title, setTitle] = useState('');
  const [instacartLoading, setInstacartLoading] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState<VideoSearchResult[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [inGroceryList, setInGroceryList] = useState(false);

  const { user } = useAuth();

  const loadRecipe = useCallback(async () => {
    if (!id) return;
    const r = await getRecipeById(id);
    if (r) {
      setRecipe(r);
      setTitle(r.title);
      setInGroceryList(await isRecipeInGroceryList(r.id));
    }
  }, [id]);

  useEffect(() => {
    loadRecipe();
  }, [loadRecipe]);

  useEffect(() => {
    if (!recipe) return;
    const query = recipe.title || recipe.videoTitle;
    if (!query) return;

    let cancelled = false;
    (async () => {
      try {
        setLoadingRelated(true);
        const results = await searchRecipeVideos(`${query} recipe`);
        if (cancelled) return;
        const filtered = results.filter((v) => v.videoId !== recipe.videoId).slice(0, 4);
        setRelatedVideos(filtered);
      } catch {
        if (!cancelled) setRelatedVideos([]);
      } finally {
        if (!cancelled) setLoadingRelated(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [recipe]);

  async function handleTitleBlur() {
    if (!recipe || title === recipe.title) return;
    await updateRecipe(recipe.id, { title });
    await loadRecipe();
  }

  async function handleInstacart() {
    if (!recipe) return;
    setInstacartLoading(true);
    try {
      const url = await createInstacartRecipeLink({
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        servings: recipe.servings,
        prepTimeMinutes: recipe.prepTimeMinutes,
        cookTimeMinutes: recipe.cookTimeMinutes,
        thumbnailUrl: recipe.thumbnail,
        sourceUrl: recipe.url,
      });
      await WebBrowser.openBrowserAsync(url);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to open Instacart');
    } finally {
      setInstacartLoading(false);
    }
  }

  const userAllergens = user?.preferences?.allergens ?? [];
  const recipeAllergens = recipe?.allergens ?? [];
  const intersectingAllergens = recipeAllergens.filter((a) =>
    userAllergens.includes(a.toLowerCase())
  );

  async function handleToggleGroceryList() {
    if (!recipe) return;
    if (inGroceryList) {
      await removeRecipeFromGroceryList(recipe.id);
      setInGroceryList(false);
    } else {
      await addRecipeToGroceryList(recipe.id);
      setInGroceryList(true);
    }
  }

  function handleDelete() {
    if (!recipe) return;
    Alert.alert(
      'Delete Recipe',
      `Are you sure you want to delete "${recipe.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteRecipe(recipe.id);
            router.back();
          },
        },
      ]
    );
  }

  async function handleUpdateIngredient(index: number, field: 'name' | 'quantity', value: string) {
    if (!recipe) return;
    const updated = [...recipe.ingredients];
    updated[index] = { ...updated[index], [field]: value };
    await updateRecipe(recipe.id, { ingredients: updated });
    setRecipe({ ...recipe, ingredients: updated });
  }

  async function handleUpdateInstruction(index: number, value: string) {
    if (!recipe) return;
    const updated = [...recipe.instructions];
    updated[index] = value;
    await updateRecipe(recipe.id, { instructions: updated });
    setRecipe({ ...recipe, instructions: updated });
  }

  return {
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
  };
}
