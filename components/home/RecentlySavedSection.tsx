import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/colors';
import type { Recipe } from '@/lib/types';

import { RecipeCard } from './RecipeCard';

interface Props {
  recipes: Recipe[];
  onRecipePress: (id: string) => void;
}

export function RecentlySavedSection({ recipes, onRecipePress }: Props) {
  if (recipes.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Recently Saved</Text>
          <View style={styles.rule} />
        </View>
        <Text style={styles.sectionDescription}>Pick up where you left off</Text>
      </View>
      <View style={styles.cardList}>
        {recipes.map((item) => (
          <RecipeCard
            key={item.id}
            thumbnailUri={item.thumbnail}
            title={item.title}
            onPress={() => onRecipePress(item.id)}
            channelName={item.channelTitle || undefined}
          />
        ))}
      </View>
    </View>
  );
}

const f = typography.family;

const styles = StyleSheet.create({
  section: {
    marginBottom: 48,
  },
  sectionHeader: {
    paddingHorizontal: spacing.xl,
    marginBottom: 24,
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
  cardList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
});
