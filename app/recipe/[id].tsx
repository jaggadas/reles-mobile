import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as WebBrowser from 'expo-web-browser';

import { useThemeColor } from '@/hooks/use-theme-color';
import { colors, spacing, radius, typography } from '@/constants/colors';
import { MetadataCard } from '@/components/MetadataCard';
import { Button, Tag } from '@/components/ui';
import type { Recipe } from '@/lib/types';
import { formatDifficulty, formatCuisine, formatAllergens } from '@/lib/format';
import {
  getRecipeById,
  updateRecipe,
  deleteRecipe,
} from '@/lib/storage';
import { createInstacartRecipeLink } from '@/lib/api';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [title, setTitle] = useState('');
  const [instacartLoading, setInstacartLoading] = useState(false);

  const bgColor = useThemeColor(
    { light: colors.light.background, dark: colors.dark.background },
    'background',
  );
  const textColor = useThemeColor(
    { light: colors.light.text, dark: colors.dark.text },
    'text',
  );
  const subtextColor = useThemeColor(
    { light: colors.light.textSecondary, dark: colors.dark.textSecondary },
    'text',
  );
  const cardBg = useThemeColor(
    { light: colors.light.card, dark: colors.dark.card },
    'background',
  );
  const borderColor = useThemeColor(
    { light: colors.light.borderLight, dark: colors.dark.borderLight },
    'text',
  );
  const primaryColor = useThemeColor(
    { light: colors.light.primary, dark: colors.dark.primary },
    'tint',
  );
  const linkColor = useThemeColor(
    { light: colors.light.link, dark: colors.dark.link },
    'tint',
  );
  const allergenBg = useThemeColor(
    { light: colors.light.allergenBg, dark: colors.dark.allergenBg },
    'background',
  );
  const allergenIcon = useThemeColor(
    { light: colors.light.allergenIcon, dark: colors.dark.allergenIcon },
    'text',
  );
  const allergenText = useThemeColor(
    { light: colors.light.allergenText, dark: colors.dark.allergenText },
    'text',
  );
  const stepCircle = useThemeColor(
    { light: colors.light.stepCircle, dark: colors.dark.stepCircle },
    'tint',
  );
  const errorColor = useThemeColor(
    { light: colors.light.deleteText, dark: colors.dark.deleteText },
    'text',
  );
  const textOnPrimary = useThemeColor(
    { light: colors.light.textOnPrimary, dark: colors.dark.textOnPrimary },
    'text',
  );

  const loadRecipe = useCallback(async () => {
    if (!id) return;
    const r = await getRecipeById(id);
    if (r) {
      setRecipe(r);
      setTitle(r.title);
    }
  }, [id]);

  useEffect(() => {
    loadRecipe();
  }, [loadRecipe]);

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

  if (!recipe) {
    return (
      <View style={[styles.loading, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={primaryColor as string} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: recipe.title, headerBackTitle: 'Back', headerBackVisible: true }} />
      <ScrollView style={[styles.container, { backgroundColor: bgColor }]} contentContainerStyle={styles.content}>
        {/* TODO: IMAGE REPLACEMENT PENDING — Add branded header illustration here */}

        {/* Title */}
        <TextInput
          style={[styles.title, { color: textColor }]}
          value={title}
          onChangeText={setTitle}
          onBlur={handleTitleBlur}
          multiline
        />

        {/* Metadata */}
        <MetadataCard
          servings={recipe.servings}
          prepTimeMinutes={recipe.prepTimeMinutes}
          cookTimeMinutes={recipe.cookTimeMinutes}
          caloriesKcal={recipe.caloriesKcal}
        />

        {/* Details */}
        {(recipe.cuisine || recipe.difficulty || (recipe.allergens && recipe.allergens.length > 0)) && (
          <View style={[styles.detailsCard, { backgroundColor: cardBg, borderColor }]}>
            {recipe.cuisine && recipe.cuisine !== 'OTHER' && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: subtextColor }]}>Cuisine</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{formatCuisine(recipe.cuisine)}</Text>
              </View>
            )}
            {recipe.difficulty && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: subtextColor }]}>Difficulty</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{formatDifficulty(recipe.difficulty)}</Text>
              </View>
            )}
            {recipe.allergens && recipe.allergens.length > 0 && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: subtextColor }]}>Allergens</Text>
                <View style={[styles.allergenBadge, { backgroundColor: allergenBg }]}>
                  <MaterialIcons name="warning" size={13} color={allergenIcon as string} />
                  <Text style={[styles.allergenText, { color: allergenText }]}>
                    {formatAllergens(recipe.allergens)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Instacart */}
        <Button
          title="Order on Instacart"
          icon="shopping-bag"
          onPress={handleInstacart}
          variant="secondary"
          loading={instacartLoading}
          style={styles.instacartButton}
        />

        {/* Source video */}
        {recipe.videoId && (
          <Pressable
            onPress={() => Linking.openURL(recipe.url)}
            style={[styles.videoCard, { backgroundColor: cardBg, borderColor }]}
          >
            <Image source={{ uri: recipe.thumbnail }} style={styles.videoThumb} />
            <View style={styles.videoInfo}>
              <Text style={[styles.videoTitle, { color: textColor }]} numberOfLines={2}>
                {recipe.videoTitle || recipe.title}
              </Text>
              {recipe.channelTitle ? (
                <Text style={[styles.videoChannel, { color: subtextColor }]}>
                  {recipe.channelTitle}
                </Text>
              ) : null}
              <Text style={[styles.videoLink, { color: linkColor }]}>Watch on YouTube</Text>
            </View>
          </Pressable>
        )}

        {/* Accompanying recipes */}
        {recipe.accompanyingRecipes && recipe.accompanyingRecipes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Goes Well With</Text>
            <View style={styles.companionList}>
              {recipe.accompanyingRecipes.map((name, i) => (
                <Pressable
                  key={i}
                  onPress={() => router.navigate({ pathname: '/(tabs)', params: { search: name } })}
                >
                  <Tag label={name} variant="outlined" />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Ingredients ({recipe.ingredients.length})
          </Text>
          {recipe.ingredients.map((ing, i) => (
            <View key={i} style={[styles.ingredientRow, { borderBottomColor: borderColor }]}>
              <TextInput
                style={[styles.ingredientQuantity, { color: subtextColor }]}
                value={ing.quantity}
                onChangeText={(v) => handleUpdateIngredient(i, 'quantity', v)}
              />
              <TextInput
                style={[styles.ingredientName, { color: textColor }]}
                value={ing.name}
                onChangeText={(v) => handleUpdateIngredient(i, 'name', v)}
              />
            </View>
          ))}
        </View>

        {/* Instructions */}
        {recipe.instructions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Instructions</Text>
            {recipe.instructions.map((step, i) => (
              <View key={i} style={styles.instructionRow}>
                <View style={[styles.stepNumber, { backgroundColor: stepCircle }]}>
                  <Text style={[styles.stepNumberText, { color: textOnPrimary }]}>{i + 1}</Text>
                </View>
                <TextInput
                  style={[styles.instructionText, { color: textColor }]}
                  value={step}
                  onChangeText={(v) => handleUpdateInstruction(i, v)}
                  multiline
                />
              </View>
            ))}
          </View>
        )}

        {/* Delete */}
        <Pressable onPress={handleDelete} style={styles.deleteLink}>
          <MaterialIcons name="delete-outline" size={16} color={errorColor as string} />
          <Text style={[styles.deleteLinkText, { color: errorColor }]}>Delete recipe</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.size['4xl'],
    fontWeight: typography.weight.bold,
    marginBottom: spacing.sm,
  },
  detailsCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginVertical: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  detailLabel: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
  },
  detailValue: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },
  allergenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  allergenText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  instacartButton: {
    marginBottom: spacing.sm,
  },
  videoCard: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginVertical: spacing.sm,
    borderWidth: 1,
  },
  videoThumb: {
    width: 120,
    height: 80,
  },
  videoInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  videoTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    marginBottom: 2,
  },
  videoChannel: {
    fontSize: typography.size.sm,
    marginBottom: 2,
  },
  videoLink: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    marginBottom: spacing.md,
  },
  companionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  ingredientQuantity: {
    width: 90,
    fontSize: typography.size.base,
    marginRight: spacing.sm,
  },
  ingredientName: {
    flex: 1,
    fontSize: typography.size.base,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: 10,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  instructionText: {
    flex: 1,
    fontSize: typography.size.base,
    lineHeight: 20,
  },
  deleteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xxl,
    paddingVertical: spacing.md,
  },
  deleteLinkText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
  },
});
