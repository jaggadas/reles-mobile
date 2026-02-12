import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/colors';
import { getThumbnailUrl } from '@/lib/api';
import type { VideoSearchResult } from '@/lib/types';

import { RecipeCard } from './RecipeCard';

interface Props {
  videos: VideoSearchResult[];
  onVideoPress: (videoId: string) => void;
  getThumbnailUrl?: (videoId: string) => string;
}

export function PickedForYouSection({ videos, onVideoPress }: Props) {
  if (videos.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Picked For You</Text>
          <View style={styles.rule} />
        </View>
        <Text style={styles.sectionDescription}>Recipes we think you'll love</Text>
      </View>
      <View style={styles.cardList}>
        {videos.map((item) => (
          <RecipeCard
            key={item.videoId}
            thumbnailUri={getThumbnailUrl(item.videoId)}
            title={item.title}
            onPress={() => onVideoPress(item.videoId)}
            channelName={item.channelName || undefined}
            channelThumbnail={item.channelThumbnail}
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
