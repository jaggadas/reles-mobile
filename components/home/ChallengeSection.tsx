import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/colors';
import { getThumbnailUrl, type FeedRecipe } from '@/lib/api';

import { RecipeCard } from './RecipeCard';

interface Props {
  recipes: FeedRecipe[];
  onRecipePress: (videoId: string) => void;
}

const DIFFICULTY_LABELS = ['', 'Easy', 'Easy', 'Medium', 'Hard', 'Expert'];

export function ChallengeSection({ recipes, onRecipePress }: Props) {
  if (recipes.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Ready for a Challenge?</Text>
          <View style={styles.rule} />
        </View>
        <Text style={styles.sectionDescription}>Push your skills to the next level</Text>
      </View>
      <View style={styles.cardList}>
        {recipes.map((item) => (
          <RecipeCard
            key={item.videoId}
            thumbnailUri={getThumbnailUrl(item.videoId)}
            title={item.title}
            onPress={() => onRecipePress(item.videoId)}
            badges={item.difficulty > 0 ? [DIFFICULTY_LABELS[item.difficulty]] : undefined}
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
