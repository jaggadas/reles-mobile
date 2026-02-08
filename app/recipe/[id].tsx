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
import { MetadataCard } from '@/components/MetadataCard';
import type { Recipe } from '@/lib/types';
import { formatDifficulty, formatCuisine, formatAllergens } from '@/lib/format';
import {
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  addRecipeToGroceryList,
  removeRecipeFromGroceryList,
  isRecipeInGroceryList,
} from '@/lib/storage';
import { createInstacartRecipeLink, searchRecipeVideos } from '@/lib/api';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [title, setTitle] = useState('');
  const [inGroceryList, setInGroceryList] = useState(false);
  const [instacartLoading, setInstacartLoading] = useState(false);

  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  const cardBg = useThemeColor({ light: '#f9fafb', dark: '#1f2937' }, 'background');

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

  async function handleTitleBlur() {
    if (!recipe || title === recipe.title) return;
    await updateRecipe(recipe.id, { title });
    await loadRecipe();
  }

  async function handleToggleGrocery() {
    if (!recipe) return;
    if (inGroceryList) {
      await removeRecipeFromGroceryList(recipe.id);
    } else {
      await addRecipeToGroceryList(recipe.id);
    }
    setInGroceryList(!inGroceryList);
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
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: recipe.title }} />
      <ScrollView style={[styles.container, { backgroundColor: bgColor }]} contentContainerStyle={styles.content}>
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

        {/* Tags row */}
        <View style={styles.tagsRow}>
          {recipe.cuisine && recipe.cuisine !== 'OTHER' && (
            <View style={[styles.tag, { backgroundColor: cardBg }]}>
              <Text style={[styles.tagText, { color: textColor }]}>
                {formatCuisine(recipe.cuisine)}
              </Text>
            </View>
          )}
          {recipe.difficulty ? (
            <View style={[styles.tag, { backgroundColor: cardBg }]}>
              <Text style={[styles.tagText, { color: textColor }]}>
                {formatDifficulty(recipe.difficulty)}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Allergens */}
        {recipe.allergens && recipe.allergens.length > 0 && (
          <View style={[styles.allergenRow, { backgroundColor: '#fef3c7' }]}>
            <MaterialIcons name="warning" size={16} color="#d97706" />
            <Text style={styles.allergenText}>
              {formatAllergens(recipe.allergens)}
            </Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          <Pressable
            onPress={handleToggleGrocery}
            style={[styles.actionButton, inGroceryList && styles.actionButtonActive]}
          >
            <MaterialIcons
              name={inGroceryList ? "remove-shopping-cart" : "add-shopping-cart"}
              size={18}
              color={inGroceryList ? '#ef4444' : '#0a7ea4'}
            />
            <Text style={[styles.actionText, inGroceryList && { color: '#ef4444' }]}>
              {inGroceryList ? 'Remove from List' : 'Add to List'}
            </Text>
          </Pressable>

          <Pressable onPress={handleInstacart} style={styles.actionButton} disabled={instacartLoading}>
            {instacartLoading ? (
              <ActivityIndicator size="small" />
            ) : (
              <>
                <MaterialIcons name="shopping-bag" size={18} color="#0a7ea4" />
                <Text style={styles.actionText}>Instacart</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Source video */}
        {recipe.videoId && (
          <Pressable
            onPress={() => Linking.openURL(recipe.url)}
            style={[styles.videoCard, { backgroundColor: cardBg }]}
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
              <Text style={[styles.videoLink, { color: '#0a7ea4' }]}>Watch on YouTube</Text>
            </View>
          </Pressable>
        )}

        {/* Accompanying recipes */}
        {recipe.accompanyingRecipes && recipe.accompanyingRecipes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Goes Well With</Text>
            <View style={styles.companionList}>
              {recipe.accompanyingRecipes.map((name, i) => (
                <View key={i} style={[styles.companionChip, { backgroundColor: cardBg }]}>
                  <Text style={[styles.companionText, { color: textColor }]}>{name}</Text>
                </View>
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
            <View key={i} style={styles.ingredientRow}>
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
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
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

        {/* Delete button */}
        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <MaterialIcons name="delete" size={18} color="#ef4444" />
          <Text style={styles.deleteText}>Delete Recipe</Text>
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
    padding: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  allergenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  allergenText: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonActive: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a7ea4',
  },
  videoCard: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  videoChannel: {
    fontSize: 12,
    marginBottom: 2,
  },
  videoLink: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  companionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  companionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  companionText: {
    fontSize: 13,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  ingredientQuantity: {
    width: 90,
    fontSize: 14,
    marginRight: 8,
  },
  ingredientName: {
    flex: 1,
    fontSize: 14,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  deleteText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
