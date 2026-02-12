import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/colors';
import type { AccompanyingSuggestion } from '@/hooks/useDiscovery';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.xl * 2 - spacing.lg) / 2;

interface Props {
  suggestions: AccompanyingSuggestion[];
  onSuggestionPress: (query: string) => void;
}

export function ContinueJourneySection({ suggestions, onSuggestionPress }: Props) {
  if (suggestions.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Continue Your Journey</Text>
          <View style={styles.rule} />
        </View>
        <Text style={styles.sectionDescription}>Inspired by your recent recipes</Text>
      </View>
      <View style={styles.cardList}>
        {suggestions.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => onSuggestionPress(item.query)}
            style={({ pressed }) => [
              styles.card,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.suggestionLabel} numberOfLines={2}>
              {item.label}
            </Text>
            <View style={styles.sourceRow}>
              {item.sourceRecipeThumbnail ? (
                <Image
                  source={{ uri: item.sourceRecipeThumbnail }}
                  style={styles.sourceThumbnail}
                  contentFit="cover"
                />
              ) : null}
              <Text style={styles.sourceText} numberOfLines={1}>
                {item.sourceRecipeTitle}
              </Text>
            </View>
          </Pressable>
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
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  suggestionLabel: {
    fontFamily: f.headingBold,
    fontSize: typography.size.lg,
    fontVariant: ['no-common-ligatures'],
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sourceThumbnail: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  sourceText: {
    flex: 1,
    fontFamily: f.body,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
});
