import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { Recipe } from '@/lib/types';
import { formatTime, formatDifficulty } from '@/lib/format';
import { useThemeColor } from '@/hooks/use-theme-color';

interface Props {
  recipe: Recipe;
  onPress: () => void;
  onAddToGrocery?: () => void;
  isInGroceryList?: boolean;
}

export function RecipeCard({ recipe, onPress, onAddToGrocery, isInGroceryList }: Props) {
  const cardBg = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');

  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: cardBg }]}>
      <Image source={{ uri: recipe.thumbnail }} style={styles.thumbnail} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
          {recipe.title}
        </Text>
        <View style={styles.meta}>
          {recipe.ingredients.length > 0 && (
            <Text style={[styles.metaText, { color: subtextColor }]}>
              {recipe.ingredients.length} ingredients
            </Text>
          )}
          {(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0) > 0 && (
            <Text style={[styles.metaText, { color: subtextColor }]}>
              {formatTime((recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0))}
            </Text>
          )}
          {recipe.difficulty ? (
            <Text style={[styles.metaText, { color: subtextColor }]}>
              {formatDifficulty(recipe.difficulty)}
            </Text>
          ) : null}
        </View>
      </View>
      {onAddToGrocery && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onAddToGrocery();
          }}
          style={styles.addButton}
          hitSlop={8}
        >
          <MaterialIcons
            name={isInGroceryList ? "remove-shopping-cart" : "add-shopping-cart"}
            size={22}
            color={isInGroceryList ? '#ef4444' : '#0a7ea4'}
          />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  thumbnail: {
    width: 100,
    height: 80,
  },
  content: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
  },
  addButton: {
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});
