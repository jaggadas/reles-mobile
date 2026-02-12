import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

import type { Recipe } from '@/lib/types';
import {
  addRecipeToGroceryList,
  removeRecipeFromGroceryList,
  isRecipeInGroceryList,
} from '@/lib/storage';
import { apiGetSavedRecipes } from '@/lib/api';

export function useRecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [grocerySet, setGrocerySet] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try {
      const allRecipes = await apiGetSavedRecipes();
      setRecipes(allRecipes);

      const inGrocery = new Set<string>();
      for (const r of allRecipes) {
        if (await isRecipeInGroceryList(r.videoId)) {
          inGrocery.add(r.videoId);
        }
      }
      setGrocerySet(inGrocery);
    } finally {
      setLoading(false);
    }
  }

  async function toggleGrocery(recipe: Recipe) {
    if (grocerySet.has(recipe.videoId)) {
      await removeRecipeFromGroceryList(recipe.videoId);
    } else {
      await addRecipeToGroceryList(recipe.videoId);
    }
    await loadData();
  }

  return { recipes, loading, grocerySet, toggleGrocery };
}
