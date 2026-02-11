import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors, spacing } from '@/constants/colors';
import { RecipeCard } from '@/components/RecipeCard';
import { EmptyState } from '@/components/ui';
import { useRecipeList } from '@/hooks/useRecipeList';

export default function RecipesScreen() {
  const router = useRouter();
  const { recipes, grocerySet, toggleGrocery } = useRecipeList();
  const tabBarHeight = useBottomTabBarHeight();

  const bgColor = colors.background;

  if (recipes.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <EmptyState
          icon="menu-book"
          title="No Recipes Yet"
          subtitle="Go to the Search tab to extract recipes from YouTube videos."
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
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
        contentContainerStyle={[styles.list, { paddingBottom: tabBarHeight }]}
      />
    </View>
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
