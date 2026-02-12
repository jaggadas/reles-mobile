import { Image } from 'expo-image';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { colors, radius, spacing, typography } from '@/constants/colors';
import { EmptyState } from '@/components/ui';
import { formatTime, formatCuisine } from '@/lib/format';
import { useRecipeList } from '@/hooks/useRecipeList';
import type { Recipe } from '@/lib/types';

const f = typography.family;

// ── Recipe Card ──────────────────────────────────────────────

function SavedRecipeCard({
  recipe,
  onPress,
  onToggleGrocery,
  isInGroceryList,
}: {
  recipe: Recipe;
  onPress: () => void;
  onToggleGrocery: () => void;
  isInGroceryList: boolean;
}) {
  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.thumbnailWrapper}>
        {recipe.thumbnail ? (
          <Image
            source={{ uri: recipe.thumbnail }}
            style={{ width: '150%', height: '150%' }}
            contentFit="cover"
          />
        ) : (
          <MaterialIcons name="restaurant" size={20} color={colors.textMuted} />
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {recipe.title}
        </Text>
        <View style={styles.metaRow}>
          {totalTime > 0 && (
            <View style={styles.metaTag}>
              <MaterialIcons name="timer" size={11} color={colors.textSecondary} />
              <Text style={styles.metaText}>{formatTime(totalTime)}</Text>
            </View>
          )}
          {recipe.cuisine && recipe.cuisine !== 'OTHER' && (
            <View style={styles.metaTag}>
              <MaterialIcons name="restaurant" size={11} color={colors.textSecondary} />
              <Text style={styles.metaText}>{formatCuisine(recipe.cuisine)}</Text>
            </View>
          )}
        </View>
      </View>
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          onToggleGrocery();
        }}
        style={[
          styles.groceryButton,
          isInGroceryList && styles.groceryButtonActive,
        ]}
        hitSlop={8}
      >
        <MaterialIcons
          name={isInGroceryList ? 'check' : 'add-shopping-cart'}
          size={18}
          color={isInGroceryList ? colors.textOnPrimary : colors.primary}
        />
      </Pressable>
    </Pressable>
  );
}

// ── Main Screen ──────────────────────────────────────────────

export default function RecipesScreen() {
  const router = useRouter();
  const { recipes, grocerySet, toggleGrocery } = useRecipeList();
  const tabBarHeight = useBottomTabBarHeight();
  const { top: safeTop } = useSafeAreaInsets();

  if (recipes.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.pageHeader, { paddingTop: safeTop + spacing.xl }]}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Saved Recipes</Text>
            <View style={styles.rule} />
          </View>
        </View>
        <EmptyState
          icon="menu-book"
          title="No Recipes Yet"
          subtitle="Go to the Search tab to extract recipes from YouTube videos."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={[styles.pageHeader, { paddingTop: safeTop + spacing.xl }]}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Saved Recipes</Text>
              <View style={styles.rule} />
            </View>
            <Text style={styles.sectionDescription}>
              {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} saved
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <SavedRecipeCard
            recipe={item}
            onPress={() => router.push(`/recipe/${item.id}`)}
            onToggleGrocery={() => toggleGrocery(item)}
            isInGroceryList={grocerySet.has(item.id)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    flexGrow: 1,
  },

  // ── Page Header ────────────────────────────────────────
  pageHeader: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing['2xl'],
    gap: spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  sectionTitle: {
    fontFamily: f.headingBold,
    fontSize: typography.size['3xl'],
    fontVariant: ['no-common-ligatures'],
    color: colors.primary,
  },
  sectionDescription: {
    fontFamily: f.body,
    fontSize: typography.size.base,
    color: colors.textSecondary,
  },
  rule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  // ── Card ───────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    paddingLeft: 80 + spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.lg,
  },
  thumbnailWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 80,
    overflow: 'hidden',
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  cardTitle: {
    fontFamily: f.bodySemibold,
    fontSize: typography.size.lg,
    color: colors.text,
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontFamily: f.body,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },

  // ── Grocery Button ─────────────────────────────────────
  groceryButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  groceryButtonActive: {
    backgroundColor: colors.success,
  },
});
