import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, FlatList } from 'react-native';
import type { VideoSearchResult } from '@/lib/types';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors, spacing, radius, typography } from '@/constants/colors';

interface Props {
  results: VideoSearchResult[];
  onSelect: (result: VideoSearchResult) => void;
}

export function VideoSearchResults({ results, onSelect }: Props) {
  const textColor = useThemeColor(
    { light: colors.light.text, dark: colors.dark.text },
    'text',
  );
  const subtextColor = useThemeColor(
    { light: colors.light.textSecondary, dark: colors.dark.textSecondary },
    'text',
  );
  const separatorColor = useThemeColor(
    { light: colors.light.separator, dark: colors.dark.separator },
    'text',
  );

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
          </View>
        </Pressable>
      )}
      style={styles.list}
    />
  );
}

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
    marginBottom: spacing.xs,
  },
  channel: {
    fontSize: typography.size.sm,
  },
});
