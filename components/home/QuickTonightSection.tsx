import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/colors';
import { getThumbnailUrl, type FeedRecipe } from '@/lib/api';

import { RecipeCard } from './RecipeCard';

interface Props {
  recipes: FeedRecipe[];
  onRecipePress: (videoId: string) => void;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function QuickTonightSection({ recipes, onRecipePress }: Props) {
  if (recipes.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Quick Tonight</Text>
          <View style={styles.rule} />
        </View>
        <Text style={styles.sectionDescription}>Ready in 30 minutes or less</Text>
      </View>
      <View style={styles.cardList}>
        {recipes.map((item) => (
          <RecipeCard
            key={item.videoId}
            thumbnailUri={getThumbnailUrl(item.videoId)}
            title={item.title}
            onPress={() => onRecipePress(item.videoId)}
            badges={item.totalTimeMinutes > 0 ? [formatTime(item.totalTimeMinutes)] : undefined}
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
