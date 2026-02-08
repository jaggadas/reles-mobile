import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, FlatList } from 'react-native';
import type { VideoSearchResult } from '@/lib/types';
import { useThemeColor } from '@/hooks/use-theme-color';

interface Props {
  results: VideoSearchResult[];
  onSelect: (result: VideoSearchResult) => void;
}

export function VideoSearchResults({ results, onSelect }: Props) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');

  if (results.length === 0) return null;

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => item.videoId}
      renderItem={({ item }) => (
        <Pressable onPress={() => onSelect(item)} style={styles.item}>
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
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  thumbnail: {
    width: 120,
    height: 68,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  channel: {
    fontSize: 12,
  },
});
