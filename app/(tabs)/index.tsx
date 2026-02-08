import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useThemeColor } from '@/hooks/use-theme-color';
import { colors, spacing, radius, typography } from '@/constants/colors';
import { ExtractionCard } from '@/components/ExtractionCard';
import { VideoSearchResults } from '@/components/VideoSearchResults';
import { EmptyState } from '@/components/ui';
import type { ExtractionPhase, VideoSearchResult } from '@/lib/types';
import {
  extractVideoId,
  getThumbnailUrl,
  searchRecipeVideos,
  fetchVideoDetails,
  extractIngredients,
} from '@/lib/api';
import { insertRecipe, findRecipeByVideoId } from '@/lib/storage';

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VideoSearchResult[]>([]);
  const [phase, setPhase] = useState<ExtractionPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const bgColor = useThemeColor(
    { light: colors.light.background, dark: colors.dark.background },
    'background',
  );
  const textColor = useThemeColor(
    { light: colors.light.text, dark: colors.dark.text },
    'text',
  );
  const inputBg = useThemeColor(
    { light: colors.light.inputBackground, dark: colors.dark.inputBackground },
    'background',
  );
  const placeholderColor = useThemeColor(
    { light: colors.light.textMuted, dark: colors.dark.textMuted },
    'text',
  );
  const primaryColor = useThemeColor(
    { light: colors.light.primary, dark: colors.dark.primary },
    'tint',
  );
  const primaryTextColor = useThemeColor(
    { light: colors.light.textOnPrimary, dark: colors.dark.textOnPrimary },
    'text',
  );

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    Keyboard.dismiss();
    setError(null);
    setSearchResults([]);

    const videoId = extractVideoId(trimmed);
    if (videoId) {
      await handleExtract(videoId);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchRecipeVideos(trimmed);
      setSearchResults(results);
      if (results.length === 0) {
        setError('No videos found. Try a different search.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const handleExtract = useCallback(async (videoId: string) => {
    setError(null);
    setSearchResults([]);

    const existing = await findRecipeByVideoId(videoId);
    if (existing) {
      router.push(`/recipe/${existing.id}`);
      return;
    }

    try {
      setPhase('fetching');
      const details = await fetchVideoDetails(videoId);

      setPhase('extracting');
      const extracted = await extractIngredients(videoId);

      setPhase('success');

      const id = await insertRecipe({
        videoId,
        title: extracted.title || details.title,
        videoTitle: details.title,
        channelTitle: details.channelTitle,
        thumbnail: getThumbnailUrl(videoId),
        url: `https://www.youtube.com/watch?v=${videoId}`,
        ingredients: extracted.ingredients,
        instructions: extracted.instructions,
        servings: extracted.servings,
        prepTimeMinutes: extracted.prepTimeMinutes,
        cookTimeMinutes: extracted.cookTimeMinutes,
        allergens: extracted.allergens,
        caloriesKcal: extracted.caloriesKcal,
        difficulty: extracted.difficulty,
        cuisine: extracted.cuisine,
        accompanyingRecipes: extracted.accompanyingRecipes,
      });

      setTimeout(() => {
        setPhase('idle');
        router.push(`/recipe/${id}`);
      }, 800);
    } catch (err) {
      setPhase('idle');
      setError(err instanceof Error ? err.message : 'Extraction failed');
    }
  }, [router]);

  const handleSelectVideo = useCallback((result: VideoSearchResult) => {
    handleExtract(result.videoId);
  }, [handleExtract]);

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.searchContainer}>
        <View style={[styles.inputWrapper, { backgroundColor: inputBg }]}>
          <MaterialIcons name="search" size={20} color={placeholderColor as string} />
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Paste YouTube URL or search recipes..."
            placeholderTextColor={placeholderColor as string}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
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
          onPress={handleSearch}
          style={[styles.searchButton, { backgroundColor: primaryColor }]}
        >
          <Text style={[styles.searchButtonText, { color: primaryTextColor }]}>Go</Text>
        </Pressable>
      </View>

      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor as string} />
          <Text style={[styles.loadingText, { color: textColor }]}>Searching...</Text>
        </View>
      )}

      <ExtractionCard phase={phase} error={error} />

      {searchResults.length > 0 && phase === 'idle' && (
        <VideoSearchResults results={searchResults} onSelect={handleSelectVideo} />
      )}

      {!isSearching && searchResults.length === 0 && phase === 'idle' && !error && (
        <EmptyState
          icon="restaurant"
          title="Extract Recipes from YouTube"
          subtitle="Paste a YouTube URL or search for cooking videos to get started."
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.size.lg,
    height: '100%',
  },
  searchButton: {
    borderRadius: radius.md,
    height: 44,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.size.base,
  },
});
