import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

import type { Recipe } from '@/lib/types';
import {
  getAllRecipes,
  addRecipeToGroceryList,
  removeRecipeFromGroceryList,
  isRecipeInGroceryList,
} from '@/lib/storage';

export function useRecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [grocerySet, setGrocerySet] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const allRecipes = await getAllRecipes();
    setRecipes(allRecipes);

    const inGrocery = new Set<string>();
    for (const r of allRecipes) {
      if (await isRecipeInGroceryList(r.id)) {
        inGrocery.add(r.id);
      }
    }
    setGrocerySet(inGrocery);
  }

  async function toggleGrocery(recipe: Recipe) {
    if (grocerySet.has(recipe.id)) {
      await removeRecipeFromGroceryList(recipe.id);
    } else {
      await addRecipeToGroceryList(recipe.id);
    }
    await loadData();
  }

  return { recipes, grocerySet, toggleGrocery };
}
