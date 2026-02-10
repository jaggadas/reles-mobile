import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { ExtractionCard } from '@/components/ExtractionCard';
import { VideoSearchResults } from '@/components/VideoSearchResults';
import { EXPLORE_CATEGORIES } from '@/constants/explore-categories';
import { formatCuisine } from '@/lib/format';
import { useRecipeSearch } from '@/hooks/useRecipeSearch';

// ── Component ────────────────────────────────────────────────────

export default function HomeScreen() {
  const {
    query,
    setQuery,
    searchResults,
    setSearchResults,
    phase,
    error,
    setError,
    isSearching,
    vegOnly,
    setVegOnly,
    inputRef,
    greetingData,
    trendingSearches,
    season,
    recipeOfTheDay,
    recentRecipes,
    forYouSuggestions,
    popularRecipes,
    showIdle,
    handleSearch,
    handleSelectVideo,
    handlePopularPress,
    handleCategoryPress,
    router,
    getThumbnailUrl,
  } = useRecipeSearch();

  // ── Colors ──
  const bgColor = colors.background;
  const textColor = colors.text;
  const subtextColor = colors.textSecondary;
  const inputBg = colors.inputBackground;
  const placeholderColor = colors.textMuted;
  const primaryColor = colors.primary;
  const primaryTextColor = colors.textOnPrimary;
  const primaryLightColor = colors.primaryLight;
  const cardBg = colors.card;
  const accentColor = colors.accent;
  const categoryBg = colors.categoryBg;
  const borderColor = colors.borderLight;

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={[styles.greetingText, { color: textColor }]}>
          {greetingData.greeting}
        </Text>
        <Text style={[styles.greetingSubtext, { color: subtextColor }]}>
          {greetingData.subtitle}
        </Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: borderColor as string }]}>
          <MaterialIcons name="search" size={20} color={placeholderColor as string} />
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: textColor }]}
            placeholder="Paste URL or search recipes..."
            placeholderTextColor={placeholderColor as string}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); setSearchResults([]); setError(null); }}>
              <MaterialIcons name="close" size={20} color={placeholderColor as string} />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={() => handleSearch()}
          style={[styles.searchButton, { backgroundColor: primaryColor }]}
        >
          <MaterialIcons name="arrow-forward" size={20} color={primaryTextColor as string} />
        </Pressable>
      </View>
      <View style={styles.vegToggleRow}>
        <Pressable
          onPress={() => setVegOnly((prev) => !prev)}
          style={({ pressed }) => [
            styles.vegToggle,
            {
              backgroundColor: pressed || vegOnly ? (primaryLightColor as string) : 'transparent',
              borderColor: vegOnly ? (primaryColor as string) : (borderColor as string),
            },
          ]}
        >
          <MaterialIcons
            name={vegOnly ? 'check-box' : 'check-box-outline-blank'}
            size={16}
            color={vegOnly ? (primaryColor as string) : (subtextColor as string)}
          />
          <Text style={[styles.vegToggleLabel, { color: subtextColor }]}>Veg mode</Text>
        </Pressable>
      </View>

      {/* Trending searches (only when idle) */}
      {showIdle && (
        <View style={styles.trendingContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
            <MaterialIcons name="trending-up" size={16} color={subtextColor as string} style={{ marginRight: 6 }} />
            {trendingSearches.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => handleCategoryPress(item.query)}
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
      )}

      {/* Loading state */}
      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor as string} />
          <Text style={[styles.loadingText, { color: subtextColor }]}>Searching recipes...</Text>
        </View>
      )}

      {/* Extraction card */}
      <ExtractionCard phase={phase} error={error} />

      {/* Search results */}
      {searchResults.length > 0 && phase === 'idle' && (
        <VideoSearchResults results={searchResults} onSelect={handleSelectVideo} />
      )}

      {/* Idle state: all sections */}
      {showIdle && (
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
                  { backgroundColor: cardBg, transform: [{ scale: pressed ? 0.98 : 1 }] },
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
                contentContainerStyle={styles.horizontalList}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => router.push(`/recipe/${item.id}`)}
                    style={({ pressed }) => [
                      styles.recentCard,
                      { backgroundColor: cardBg, transform: [{ scale: pressed ? 0.97 : 1 }] },
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
                contentContainerStyle={styles.horizontalList}
              >
                {forYouSuggestions.map((item) => (
                  <Pressable
                    key={item.label}
                    onPress={() => handleCategoryPress(item.query)}
                    style={({ pressed }) => [
                      styles.suggestionChip,
                      {
                        backgroundColor: primaryLightColor as string,
                        transform: [{ scale: pressed ? 0.95 : 1 }],
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
                  onPress={() => handleCategoryPress(cat.query)}
                  style={({ pressed }) => [
                    styles.categoryCard,
                    {
                      backgroundColor: categoryBg as string,
                      borderColor: borderColor as string,
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    },
                  ]}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.categoryLabel, { color: textColor }]}>
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
              contentContainerStyle={styles.horizontalList}
            >
              {season.items.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => handleCategoryPress(item.query)}
                  style={({ pressed }) => [
                    styles.seasonalCard,
                    {
                      backgroundColor: categoryBg as string,
                      borderColor: borderColor as string,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
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
                contentContainerStyle={styles.horizontalList}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handlePopularPress(item)}
                    style={({ pressed }) => [
                      styles.popularCard,
                      { backgroundColor: cardBg, transform: [{ scale: pressed ? 0.97 : 1 }] },
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

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Greeting
  greetingContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  greetingText: {
    fontSize: typography.size['4xl'],
    fontWeight: typography.weight.bold,
    letterSpacing: -0.5,
  },
  greetingSubtext: {
    fontSize: typography.size.lg,
    marginTop: spacing.xs,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  vegToggleRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  vegToggle: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  vegToggleLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.size.lg,
    height: '100%',
  },
  searchButton: {
    borderRadius: radius.lg,
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Trending
  trendingContainer: {
    paddingBottom: spacing.sm,
  },
  trendingScroll: {
    paddingHorizontal: spacing.lg,
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
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.size.lg,
  },

  // Scroll
  scrollContent: {
    flex: 1,
  },

  // Sections
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },

  // Hero / Recipe of the Day
  heroCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.md,
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
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
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
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  heroTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroTimeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },

  // Recent recipes
  recentCard: {
    width: 140,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  recentThumbnail: {
    width: 140,
    height: 80,
  },
  recentTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
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
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },

  // Category grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  categoryCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryLabel: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
  },

  // Seasonal picks
  seasonEmoji: {
    fontSize: 22,
  },
  seasonSubtitle: {
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
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },

  // Horizontal lists
  horizontalList: {
    gap: spacing.md,
  },

  // Popular recipes
  popularCard: {
    width: 180,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.md,
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
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    lineHeight: 18,
  },
  popularMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  popularCount: {
    fontSize: typography.size.sm,
  },
});
