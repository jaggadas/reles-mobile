import React, { useState, useCallback } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/constants/colors';
import { RecipeCard } from '@/components/RecipeCard';
import { EmptyState } from '@/components/ui';
import type { Recipe } from '@/lib/types';
import {
  getAllRecipes,
  addRecipeToGroceryList,
  removeRecipeFromGroceryList,
  isRecipeInGroceryList,
} from '@/lib/storage';

export default function RecipesScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [grocerySet, setGrocerySet] = useState<Set<string>>(new Set());

  const bgColor = colors.background;

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

  if (recipes.length === 0) {
    return (
      <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: bgColor }]}>
        <EmptyState
          icon="menu-book"
          title="No Recipes Yet"
          subtitle="Go to the Extract tab to extract recipes from YouTube videos."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: bgColor }]}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => router.push(`/recipe/${item.id}`)}
            onAddToGrocery={() => toggleGrocery(item)}
            isInGroceryList={grocerySet.has(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingVertical: spacing.sm,
  },
});
