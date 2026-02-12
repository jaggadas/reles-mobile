import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/colors';
import type { MoodCategory } from '@/hooks/useDiscovery';

interface Props {
  categories: MoodCategory[];
  onCategoryPress: (query: string) => void;
}

export function MoodCategoriesSection({ categories, onCategoryPress }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>What Are You Feeling?</Text>
          <View style={styles.rule} />
        </View>
        <Text style={styles.sectionDescription}>Find recipes that match your mood</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardList}
      >
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => onCategoryPress(cat.query)}
            style={({ pressed }) => [
              styles.card,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.cardEmoji}>{cat.emoji}</Text>
            <Text style={styles.cardLabel}>{cat.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
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
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: 110,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  cardLabel: {
    fontFamily: f.bodySemibold,
    fontSize: typography.size.sm,
    color: colors.text,
    textAlign: 'center',
  },
});
