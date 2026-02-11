import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/colors';
import { EXPLORE_CATEGORIES } from '@/constants/explore-categories';
import { useDiscovery } from '@/hooks/useDiscovery';

// ── Component ────────────────────────────────────────────────────

export default function DiscoverScreen() {
  const {
    greetingData,
    heroRecipe,
    topRecipes,
    recentRecipes,
    forYouSuggestions,
    navigateToSearch,
    navigateToExtract,
    getThumbnailUrl,
    router,
  } = useDiscovery();

  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>
            {greetingData.greeting}
          </Text>
          <Text style={styles.greetingSubtext}>
            {greetingData.subtitle}
          </Text>
        </View>

        {/* Hero: Recipe of the Day (from API) */}
        {heroRecipe && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="auto-awesome" size={20} color={colors.primary} />
              <Text style={styles.sectionTitleInline}>
                Recipe of the Day
              </Text>
            </View>
            <Pressable
              onPress={() => navigateToExtract(heroRecipe.videoId)}
              style={({ pressed }) => [
                styles.heroCard,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Image
                source={{ uri: getThumbnailUrl(heroRecipe.videoId) }}
                style={styles.heroThumbnail}
              />
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle} numberOfLines={2}>
                  {heroRecipe.title}
                </Text>
                <View style={styles.heroMeta}>
                  <MaterialIcons name="visibility" size={12} color={colors.textSecondary} />
                  <Text style={styles.heroMetaText}>
                    {heroRecipe.timesAccessed} {heroRecipe.timesAccessed === 1 ? 'view' : 'views'}
                  </Text>
                </View>
              </View>
            </Pressable>
          </View>
        )}

        {/* Top Recipes */}
        {topRecipes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="local-fire-department" size={22} color={colors.accent} />
              <Text style={styles.sectionTitleInline}>
                Top Recipes
              </Text>
            </View>
            <FlatList
              data={topRecipes}
              horizontal
              scrollEnabled
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.videoId}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => navigateToExtract(item.videoId)}
                  style={({ pressed }) => [
                    styles.topCard,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Image
                    source={{ uri: getThumbnailUrl(item.videoId) }}
                    style={styles.topThumbnail}
                  />
                  <View style={styles.topInfo}>
                    <Text style={styles.topName} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={styles.topMeta}>
                      <MaterialIcons name="visibility" size={12} color={colors.textSecondary} />
                      <Text style={styles.topCount}>
                        {item.timesAccessed} {item.timesAccessed === 1 ? 'view' : 'views'}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              )}
            />
          </View>
        )}

        {/* Recently Saved */}
        {recentRecipes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="bookmark" size={20} color={colors.primary} />
              <Text style={styles.sectionTitleInline}>
                Recently Saved
              </Text>
            </View>
            <FlatList
              data={recentRecipes}
              horizontal
              scrollEnabled
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => router.push(`/recipe/${item.id}`)}
                  style={({ pressed }) => [
                    styles.topCard,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Image
                    source={{ uri: item.thumbnail }}
                    style={styles.topThumbnail}
                  />
                  <View style={styles.topInfo}>
                    <Text style={styles.topName} numberOfLines={2}>
                      {item.title}
                    </Text>
                  </View>
                </Pressable>
              )}
            />
          </View>
        )}

        {/* For You */}
        {forYouSuggestions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="favorite" size={20} color={colors.primary} />
              <Text style={styles.sectionTitleInline}>
                For You
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalList}
            >
              {forYouSuggestions.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => navigateToSearch(item.query)}
                  style={({ pressed }) => [
                    styles.suggestionChip,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Text style={styles.suggestionEmoji}>{item.emoji}</Text>
                  <Text style={styles.suggestionLabel}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* What are you feeling? */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            What are you feeling?
          </Text>
          <View style={styles.categoryGrid}>
            {EXPLORE_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => navigateToSearch(cat.query)}
                style={({ pressed }) => [
                  styles.categoryCard,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={styles.categoryLabel} numberOfLines={1}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const f = typography.family;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Greeting
  greetingContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  greetingText: {
    fontFamily: f.headingBold,
    fontSize: typography.size['4xl'],
    letterSpacing: -0.3,
    color: colors.text,
  },
  greetingSubtext: {
    fontFamily: f.body,
    fontSize: typography.size.lg,
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },

  // Sections
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: f.headingBold,
    fontSize: typography.size['3xl'],
    letterSpacing: -0.3,
    marginBottom: spacing.lg,
    color: colors.text,
  },
  sectionTitleInline: {
    fontFamily: f.headingBold,
    fontSize: typography.size['3xl'],
    letterSpacing: -0.3,
    color: colors.text,
  },

  // Hero (row card matching RecipeCard)
  heroCard: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  heroThumbnail: {
    width: 100,
    height: 80,
  },
  heroContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  heroTitle: {
    fontFamily: f.bodySemibold,
    fontSize: typography.size.lg,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroMetaText: {
    fontFamily: f.body,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },

  // Top recipes
  topCard: {
    width: 200,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  topThumbnail: {
    width: 200,
    height: 120,
  },
  topInfo: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  topName: {
    fontFamily: f.bodySemibold,
    fontSize: typography.size.base,
    lineHeight: 18,
    color: colors.text,
  },
  topMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  topCount: {
    fontFamily: f.body,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },

  // For You suggestions
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
  suggestionEmoji: {
    fontSize: 18,
  },
  suggestionLabel: {
    fontFamily: f.bodySemibold,
    fontSize: typography.size.base,
    color: colors.primary,
  },

  // Category grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryCard: {
    width: '23%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    backgroundColor: colors.categoryBg,
    borderColor: colors.borderLight,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryLabel: {
    fontFamily: f.bodySemibold,
    fontSize: typography.size.xs,
    textAlign: 'center',
    color: colors.text,
  },

  // Horizontal lists
  horizontalScroll: {
    marginHorizontal: -spacing.xl,
  },
  horizontalList: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
});
