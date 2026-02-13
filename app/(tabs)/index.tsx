import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useRef, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';

import { colors, radius, spacing, typography } from '@/constants/colors';
import {
  GreetingSection,
  PickedForYouSection,
  TrendingCuisineSection,
  QuickTonightSection,
  ContinueJourneySection,
  CuisineDeepDiveSection,
  ChallengeSection,
  MoodCategoriesSection,
  RecentlySavedSection,
} from '@/components/home';
import { useDiscovery } from '@/hooks/useDiscovery';
import type { VideoSearchResult } from '@/lib/types';
import {
  extractVideoId,
  searchRecipeVideos,
} from '@/lib/api';

const PARCHMENT = '#FFFFFF';
const f = typography.family;

// ── Search Result Card (matches saved recipe style) ──────────

function SearchResultCard({
  result,
  onPress,
}: {
  result: VideoSearchResult;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.resultCard,
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.resultThumbnailWrapper}>
        {result.thumbnail ? (
          <Image
            source={{ uri: result.thumbnail }}
            style={{ width: '150%', height: '150%' }}
            contentFit="cover"
          />
        ) : (
          <MaterialIcons name="play-circle-outline" size={20} color={colors.textMuted} />
        )}
      </View>
      <View style={styles.resultCardContent}>
        <Text style={styles.resultCardTitle} numberOfLines={2}>
          {result.title}
        </Text>
        <Text style={styles.resultCardChannel} numberOfLines={1}>
          {result.channelName}
        </Text>
      </View>
    </Pressable>
  );
}

// ── Component ────────────────────────────────────────────────────

export default function DiscoverScreen() {
  const {
    greetingData,
    feedLoading,
    pickedForYouVideos,
    trendingSection,
    quickTonightRecipes,
    accompanyingSuggestions,
    deepDiveSection,
    challengeRecipes,
    moodCategories,
    recentRecipes,
    navigateToPreview,
    getCuisineEmoji,
    getCuisineName,
    router: discoveryRouter,
  } = useDiscovery();

  const router = useRouter();
  const params = useLocalSearchParams<{ search?: string; _t?: string }>();
  const tabBarHeight = useBottomTabBarHeight();
  const { top: safeTop } = useSafeAreaInsets();

  // ── Search state ──
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VideoSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const lastSearchKey = useRef<string | null>(null);
  const skipNextDebounce = useRef(false);

  const hasSearchContent = searchResults.length > 0 || isSearching;

  // Refocus input after view switches from ScrollView to FlatList (which remounts the TextInput)
  useEffect(() => {
    if (hasSearchContent) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [hasSearchContent]);

  // Handle search param from other screens
  useEffect(() => {
    const key = params._t ? `${params.search}_${params._t}` : params.search;
    if (params.search && key !== lastSearchKey.current) {
      lastSearchKey.current = key ?? null;
      skipNextDebounce.current = true;
      setQuery(params.search);
      doSearch(params.search);
    }
  }, [params.search, params._t]);

  // Debounced auto-search
  useEffect(() => {
    if (skipNextDebounce.current) {
      skipNextDebounce.current = false;
      return;
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    if (extractVideoId(trimmed)) return;
    if (trimmed.length < 3) return;

    const timer = setTimeout(() => {
      doSearch(trimmed);
    }, 1000);

    return () => clearTimeout(timer);
  }, [query]);

  const doSearch = useCallback(
    async (searchQuery?: string) => {
      const trimmed = (searchQuery ?? query).trim();
      if (!trimmed) return;

      setSearchError(null);
      setSearchResults([]);

      const videoId = extractVideoId(trimmed);
      if (videoId) {
        Keyboard.dismiss();
        router.push({
          pathname: '/recipe/preview',
          params: { videoId },
        } as any);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchRecipeVideos(trimmed);
        setSearchResults(results);
        if (results.length === 0) {
          setSearchError('No videos found. Try a different search.');
        }
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setIsSearching(false);
      }
    },
    [query, router],
  );

  const handleSelectVideo = useCallback(
    (result: VideoSearchResult) => {
      router.push({
        pathname: '/recipe/preview',
        params: {
          videoId: result.videoId,
          title: result.title,
          channelName: result.channelName,
          thumbnail: result.thumbnail,
        },
      } as any);
    },
    [router],
  );

  const handleClearQuery = useCallback(() => {
    setQuery('');
    setSearchResults([]);
    setSearchError(null);
  }, []);

  // Clear search when home tab is pressed
  const navigation = useNavigation();
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      handleClearQuery();
      Keyboard.dismiss();
    });
    return unsubscribe;
  }, [navigation, handleClearQuery]);

  // ── Header (shared between discovery and search views) ──

  const headerContent = (
    <View style={styles.headerBorder}>
      <View style={[styles.header, { paddingTop: safeTop + spacing.lg }]}>
        <Image
          source={require('@/assets/illustrations/extract-recipes.png')}
          style={styles.headerIllustration}
          contentFit="cover"
        />
        <Image
          source={require('@/assets/images/Reles.svg')}
          style={styles.logo}
          contentFit="contain"
          tintColor="#FFFFFF"
        />
        <GreetingSection
          greeting={greetingData}
          query={query}
          onChangeQuery={setQuery}
          onSubmitSearch={() => doSearch()}
          onClearQuery={handleClearQuery}
          inputRef={inputRef}
        />
      </View>
    </View>
  );

  // ── Search results view ──

  if (hasSearchContent) {
    return (
      <View style={styles.container}>
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.videoId}
          ListHeaderComponent={
            <>
              {headerContent}
              {isSearching && (
                <View style={styles.searchLoadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.searchLoadingText}>Searching recipes...</Text>
                </View>
              )}
              {searchError && searchResults.length === 0 && !isSearching && (
                <View style={styles.searchLoadingContainer}>
                  <MaterialIcons name="search-off" size={32} color={colors.textMuted} />
                  <Text style={styles.searchLoadingText}>{searchError}</Text>
                </View>
              )}
              {searchResults.length > 0 && (
                <View style={styles.searchResultsHeader}>
                  <Text style={styles.searchResultsCount}>
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </>
          }
          renderItem={({ item }) => (
            <SearchResultCard result={item} onPress={() => handleSelectVideo(item)} />
          )}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: tabBarHeight + spacing.xxl },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    );
  }

  // ── Discovery view (default) ──

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {headerContent}

        {feedLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}

        {pickedForYouVideos.length > 0 && (
          <PickedForYouSection
            videos={pickedForYouVideos}
            onVideoPress={navigateToPreview}
          />
        )}

        {trendingSection.cuisine && trendingSection.recipes.length > 0 && (
          <TrendingCuisineSection
            cuisine={trendingSection.cuisine}
            cuisineName={getCuisineName(trendingSection.cuisine)}
            cuisineEmoji={getCuisineEmoji(trendingSection.cuisine)}
            recipes={trendingSection.recipes}
            onRecipePress={navigateToPreview}
          />
        )}

        {quickTonightRecipes.length > 0 && (
          <QuickTonightSection
            recipes={quickTonightRecipes}
            onRecipePress={navigateToPreview}
          />
        )}

        {deepDiveSection.cuisine && deepDiveSection.recipes.length > 0 && (
          <CuisineDeepDiveSection
            cuisineName={getCuisineName(deepDiveSection.cuisine)}
            cuisineEmoji={getCuisineEmoji(deepDiveSection.cuisine)}
            recipes={deepDiveSection.recipes}
            onRecipePress={navigateToPreview}
          />
        )}

        {challengeRecipes.length > 0 && (
          <ChallengeSection
            recipes={challengeRecipes}
            onRecipePress={navigateToPreview}
          />
        )}

        {accompanyingSuggestions.length > 0 && (
          <ContinueJourneySection
            suggestions={accompanyingSuggestions}
            onSuggestionPress={(q: string) => {
              setQuery(q);
              doSearch(q);
            }}
          />
        )}

        {recentRecipes.length > 0 && (
          <RecentlySavedSection
            recipes={recentRecipes}
            onRecipePress={(id) => discoveryRouter.push(`/recipe/${id}`)}
          />
        )}

        <MoodCategoriesSection
          categories={moodCategories}
          onCategoryPress={(q: string) => {
            setQuery(q);
            doSearch(q);
          }}
        />
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PARCHMENT,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerBorder: {
    backgroundColor: '#E5CCA9',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 1,
    marginBottom: 24,
  },
  header: {
    backgroundColor: '#8B1A1A',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden' as const,
  },
  headerIllustration: {
    position: 'absolute' as const,
    top: 0,
    left: 80,
    right: 0,
    bottom: 0,
    opacity: 1,
  },
  logo: {
    width: 140,
    height: 48,
    marginLeft: -24,
  },
  loadingContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },

  // ── Search Results ──
  searchLoadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  searchLoadingText: {
    fontFamily: f.body,
    fontSize: typography.size.lg,
    color: colors.textSecondary,
  },
  searchResultsHeader: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  searchResultsCount: {
    fontFamily: f.body,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },

  // ── Search Result Card (matches saved recipe style) ──
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    paddingLeft: 80 + spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  resultThumbnailWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 80,
    overflow: 'hidden',
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCardContent: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingRight: spacing.lg,
    gap: spacing.xs,
  },
  resultCardTitle: {
    fontFamily: f.bodySemibold,
    fontSize: typography.size.lg,
    color: colors.text,
    lineHeight: 21,
  },
  resultCardChannel: {
    fontFamily: f.body,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
});
