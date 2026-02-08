import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useThemeColor } from '@/hooks/use-theme-color';
import { RecipeCard } from '@/components/RecipeCard';
import type { Recipe } from '@/lib/types';
import { getAllRecipes } from '@/lib/storage';
import {
  addRecipeToGroceryList,
  removeRecipeFromGroceryList,
  isRecipeInGroceryList,
} from '@/lib/storage';

export default function RecipesScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [grocerySet, setGrocerySet] = useState<Set<string>>(new Set());

  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({ light: '#9ca3af', dark: '#6b7280' }, 'text');

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
        <View style={styles.emptyState}>
          <MaterialIcons name="menu-book" size={64} color={placeholderColor as string} />
          <Text style={[styles.emptyTitle, { color: textColor }]}>
            No Recipes Yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: placeholderColor as string }]}>
            Go to the Extract tab to extract recipes from YouTube videos.
          </Text>
        </View>
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
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
