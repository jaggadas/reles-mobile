import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { Recipe } from '@/lib/types';
import { formatTime, formatDifficulty } from '@/lib/format';
import { colors, spacing, radius, typography } from '@/constants/colors';

interface Props {
  recipe: Recipe;
  onPress: () => void;
  onAddToGrocery?: () => void;
  isInGroceryList?: boolean;
}

export function RecipeCard({ recipe, onPress, onAddToGrocery, isInGroceryList }: Props) {
  const cardBg = colors.card;
  const textColor = colors.text;
  const subtextColor = colors.textSecondary;
  const borderColor = colors.borderLight;
  const primaryColor = colors.primary;
  const errorColor = colors.error;

  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      {/* TODO: IMAGE REPLACEMENT PENDING — Replace thumbnail fallback with branded placeholder */}
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
            color={isInGroceryList ? errorColor : primaryColor}
          />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderWidth: 1,
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
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaText: {
    fontSize: typography.size.sm,
  },
  addButton: {
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
});
