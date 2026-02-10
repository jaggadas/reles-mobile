import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, FlatList } from 'react-native';
import type { VideoSearchResult } from '@/lib/types';
import { colors, spacing, radius, typography } from '@/constants/colors';

interface Props {
  results: VideoSearchResult[];
  onSelect: (result: VideoSearchResult) => void;
}

export function VideoSearchResults({ results, onSelect }: Props) {
  const textColor = colors.text;
  const subtextColor = colors.textSecondary;
  const separatorColor = colors.separator;

  const formatViews = (views?: number): string | null => {
    if (views == null) return null;
    if (views < 1000) return `${views} views`;
    const units = ['K', 'M', 'B'];
    let value = views;
    let unitIndex = -1;
    while (value >= 1000 && unitIndex < units.length - 1) {
      value /= 1000;
      unitIndex += 1;
    }
    const rounded = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
    return `${rounded}${unitIndex >= 0 ? units[unitIndex] : ''} views`;
  };

  if (results.length === 0) return null;

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => item.videoId}
      renderItem={({ item }) => (
        <Pressable onPress={() => onSelect(item)} style={[styles.item, { borderBottomColor: separatorColor }]}>
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={[styles.channel, { color: subtextColor }]} numberOfLines={1}>
              {item.channelName}
            </Text>
            {formatViews(item.viewCount) && (
              <Text style={[styles.views, { color: subtextColor }]} numberOfLines={1}>
                {formatViews(item.viewCount)}
              </Text>
            )}
          </View>
        </Pressable>
      )}
      style={styles.list}
    />
  );
}

const f = typography.family;

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  thumbnail: {
    width: 120,
    height: 68,
    borderRadius: radius.md,
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    fontFamily: f.bodySemibold,
    marginBottom: spacing.xs,
  },
  channel: {
    fontSize: typography.size.sm,
    fontFamily: f.body,
  },
  views: {
    fontSize: typography.size.xs,
    fontFamily: f.body,
    marginTop: spacing.xs / 2,
  },
});
