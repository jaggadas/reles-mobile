import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/colors';

interface RecipeCardProps {
  thumbnailUri?: string;
  title: string;
  onPress: () => void;
  badges?: string[];
  channelName?: string;
  channelThumbnail?: string;
}

const f = typography.family;
const SCREEN_WIDTH = Dimensions.get('window').width;
export const CARD_WIDTH = (SCREEN_WIDTH - spacing.xl * 2 - spacing.lg) / 2;

export function RecipeCard({
  thumbnailUri,
  title,
  onPress,
  badges,
  channelName,
  channelThumbnail,
}: RecipeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      {thumbnailUri ? (
        <View>
          <Image
            source={{ uri: thumbnailUri }}
            style={styles.thumbnail}
            contentFit="cover"
          />
          {badges && badges.length > 0 ? (
            <View style={styles.badgeRow}>
              {badges.map((label) => (
                <View key={label} style={styles.badge}>
                  <Text style={styles.badgeText}>{label}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {title}
        </Text>
        {channelName ? (
          <View style={styles.channelRow}>
            {channelThumbnail ? (
              <Image
                source={{ uri: channelThumbnail }}
                style={styles.channelAvatarImage}
              />
            ) : (
              <View style={styles.channelAvatar}>
                <Text style={styles.channelAvatarText}>
                  {channelName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.channelName} numberOfLines={1}>
              {channelName}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  thumbnail: {
    width: '100%',
    height: 48,
  },
  badgeRow: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: {
    fontFamily: f.bodySemibold,
    fontSize: typography.size.xs,
    color: '#FFFFFF',
  },
  cardBody: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    fontFamily: f.bodySemibold,
    fontSize: typography.size.lg,
    color: colors.text,
    lineHeight: 21,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  channelAvatarImage: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  channelAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelAvatarText: {
    fontFamily: f.bodySemibold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  channelName: {
    flex: 1,
    fontFamily: f.body,
    fontSize: typography.size.base,
    color: colors.textSecondary,
  },
});
