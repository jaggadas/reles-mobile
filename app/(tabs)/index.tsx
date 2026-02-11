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
import { formatCuisine } from '@/lib/format';

// ── Component ────────────────────────────────────────────────────

export default function DiscoverScreen() {
  const {
    greetingData,
    trendingSearches,
    season,
    recipeOfTheDay,
    recentRecipes,
    forYouSuggestions,
    popularRecipes,
    navigateToSearch,
    navigateToExtract,
    getThumbnailUrl,
    router,
  } = useDiscovery();

  // ── Colors ──
  const textColor = colors.text;
  const subtextColor = colors.textSecondary;
  const primaryColor = colors.primary;
  const primaryLightColor = colors.primaryLight;
  const cardBg = colors.card;
  const accentColor = colors.accent;
  const categoryBg = colors.categoryBg;
  const borderColor = colors.borderLight;

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
          <Text style={[styles.greetingText, { color: textColor }]}>
            {greetingData.greeting}
          </Text>
          <Text style={[styles.greetingSubtext, { color: subtextColor }]}>
            {greetingData.subtitle}
          </Text>
        </View>

        {/* Trending searches */}
        <View style={styles.trendingContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
            <MaterialIcons name="trending-up" size={16} color={subtextColor as string} style={{ marginRight: 6 }} />
            {trendingSearches.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => navigateToSearch(item.query)}
                style={({ pressed }) => [
                  styles.trendingChip,
                  {
                    backgroundColor: categoryBg as string,
                    borderColor: borderColor as string,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[styles.trendingLabel, { color: subtextColor }]}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Recipe of the Day */}
        {recipeOfTheDay && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="auto-awesome" size={20} color={primaryColor as string} />
              <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 0 }]}>
                Recipe of the Day
              </Text>
            </View>
            <Pressable
              onPress={() => router.push(`/recipe/${recipeOfTheDay.id}`)}
              style={({ pressed }) => [
                styles.heroCard,
                { backgroundColor: cardBg, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Image
                source={{ uri: recipeOfTheDay.thumbnail }}
                style={styles.heroImage}
              />
              <View style={styles.heroContent}>
                <Text style={[styles.heroTitle, { color: textColor }]} numberOfLines={2}>
                  {recipeOfTheDay.title}
                </Text>
                <View style={styles.heroMeta}>
                  {recipeOfTheDay.cuisine && recipeOfTheDay.cuisine !== 'OTHER' && (
                    <View style={[styles.heroBadge, { backgroundColor: primaryLightColor as string }]}>
                      <Text style={[styles.heroBadgeText, { color: primaryColor }]}>
                        {formatCuisine(recipeOfTheDay.cuisine)}
                      </Text>
                    </View>
                  )}
                  {recipeOfTheDay.cookTimeMinutes && (
                    <View style={styles.heroTime}>
                      <MaterialIcons name="schedule" size={14} color={subtextColor as string} />
                      <Text style={[styles.heroTimeText, { color: subtextColor }]}>
                        {recipeOfTheDay.cookTimeMinutes} min
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          </View>
        )}

        {/* Recently Extracted */}
        {recentRecipes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Recently Extracted
            </Text>
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
                    styles.recentCard,
                    { backgroundColor: cardBg, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Image
                    source={{ uri: item.thumbnail }}
                    style={styles.recentThumbnail}
                  />
                  <Text
                    style={[styles.recentTitle, { color: textColor }]}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        )}

        {/* For You */}
        {forYouSuggestions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="favorite" size={20} color={primaryColor as string} />
              <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 0 }]}>
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
                    {
                      backgroundColor: primaryLightColor as string,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text style={styles.suggestionEmoji}>{item.emoji}</Text>
                  <Text style={[styles.suggestionLabel, { color: primaryColor }]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* What are you feeling? */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            What are you feeling?
          </Text>
          <View style={styles.categoryGrid}>
            {EXPLORE_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => navigateToSearch(cat.query)}
                style={({ pressed }) => [
                  styles.categoryCard,
                  {
                    backgroundColor: categoryBg as string,
                    borderColor: borderColor as string,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={[styles.categoryLabel, { color: textColor }]} numberOfLines={1}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Seasonal Picks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.seasonEmoji}>{season.emoji}</Text>
            <View>
              <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 0 }]}>
                {season.name} Picks
              </Text>
              <Text style={[styles.seasonSubtitle, { color: subtextColor }]}>
                {season.subtitle}
              </Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.horizontalList}
          >
            {season.items.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => navigateToSearch(item.query)}
                style={({ pressed }) => [
                  styles.seasonalCard,
                  {
                    backgroundColor: categoryBg as string,
                    borderColor: borderColor as string,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={styles.seasonalEmoji}>{item.emoji}</Text>
                <Text style={[styles.seasonalLabel, { color: textColor }]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Today's Top Recipes */}
        {popularRecipes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="local-fire-department" size={22} color={accentColor as string} />
              <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 0 }]}>
                Today's Top Recipes
              </Text>
            </View>
            <FlatList
              data={popularRecipes}
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
                    styles.popularCard,
                    { backgroundColor: cardBg, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Image
                    source={{ uri: getThumbnailUrl(item.videoId) }}
                    style={styles.popularThumbnail}
                  />
                  <View style={styles.popularInfo}>
                    <Text
                      style={[styles.popularName, { color: textColor }]}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    <View style={styles.popularMeta}>
                      <MaterialIcons name="visibility" size={12} color={subtextColor as string} />
                      <Text style={[styles.popularCount, { color: subtextColor }]}>
                        {item.timesAccessed} {item.timesAccessed === 1 ? 'view' : 'views'}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              )}
            />
          </View>
        )}

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
    paddingBottom: spacing.sm,
  },
  greetingText: {
    fontFamily: f.headingBold,
    fontSize: typography.size['4xl'],
    letterSpacing: -0.3,
  },
  greetingSubtext: {
    fontFamily: f.body,
    fontSize: typography.size.lg,
    marginTop: spacing.xs,
  },

  // Trending
  trendingContainer: {
    paddingBottom: spacing.xxl,
  },
  trendingScroll: {
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  trendingChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  trendingLabel: {
    fontFamily: f.bodyMedium,
    fontSize: typography.size.sm,
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
  },

  // Hero / Recipe of the Day
  heroCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  heroImage: {
    width: '100%',
    height: 180,
  },
  heroContent: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  heroTitle: {
    fontFamily: f.headingBold,
    fontSize: typography.size['2xl'],
    letterSpacing: -0.2,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  heroBadgeText: {
    fontFamily: f.bodySemibold,
    fontSize: typography.size.sm,
  },
  heroTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroTimeText: {
    fontFamily: f.bodyMedium,
    fontSize: typography.size.sm,
  },

  // Recent recipes
  recentCard: {
    width: 140,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  recentThumbnail: {
    width: 140,
    height: 80,
  },
  recentTitle: {
    fontFamily: f.bodySemibold,
    fontSize: typography.size.sm,
    padding: spacing.sm,
    lineHeight: 16,
  },

  // For You suggestions
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  suggestionEmoji: {
    fontSize: 18,
  },
  suggestionLabel: {
    fontFamily: f.bodySemibold,
    fontSize: typography.size.base,
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
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryLabel: {
    fontFamily: f.bodySemibold,
    fontSize: typography.size.xs,
    textAlign: 'center',
  },

  // Seasonal picks
  seasonEmoji: {
    fontSize: 22,
  },
  seasonSubtitle: {
    fontFamily: f.body,
    fontSize: typography.size.sm,
    marginTop: 2,
  },
  seasonalCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    minWidth: 110,
  },
  seasonalEmoji: {
    fontSize: 28,
  },
  seasonalLabel: {
    fontFamily: f.bodySemibold,
    fontSize: typography.size.base,
  },

  // Horizontal lists
  horizontalScroll: {
    marginHorizontal: -spacing.xl,
  },
  horizontalList: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },

  // Popular recipes
  popularCard: {
    width: 180,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  popularThumbnail: {
    width: 180,
    height: 100,
  },
  popularInfo: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  popularName: {
    fontFamily: f.bodySemibold,
    fontSize: typography.size.base,
    lineHeight: 18,
  },
  popularMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  popularCount: {
    fontFamily: f.body,
    fontSize: typography.size.sm,
  },
});
