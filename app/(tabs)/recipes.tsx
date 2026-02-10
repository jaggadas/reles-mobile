import React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/constants/colors';
import { RecipeCard } from '@/components/RecipeCard';
import { EmptyState } from '@/components/ui';
import { useRecipeList } from '@/hooks/useRecipeList';

export default function RecipesScreen() {
  const router = useRouter();
  const { recipes, grocerySet, toggleGrocery } = useRecipeList();

  const bgColor = colors.background;

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
