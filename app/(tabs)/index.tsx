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
import { ExtractionCard } from '@/components/ExtractionCard';
import { VideoSearchResults } from '@/components/VideoSearchResults';
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

  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const inputBg = useThemeColor({ light: '#f3f4f6', dark: '#1f2937' }, 'background');
  const placeholderColor = useThemeColor({ light: '#9ca3af', dark: '#6b7280' }, 'text');

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    Keyboard.dismiss();
    setError(null);
    setSearchResults([]);

    // Check if it's a YouTube URL
    const videoId = extractVideoId(trimmed);
    if (videoId) {
      await handleExtract(videoId);
      return;
    }

    // Text search
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

    // Check if already extracted
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
        <Pressable onPress={handleSearch} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Go</Text>
        </Pressable>
      </View>

      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={[styles.loadingText, { color: textColor }]}>Searching...</Text>
        </View>
      )}

      <ExtractionCard phase={phase} error={error} />

      {searchResults.length > 0 && phase === 'idle' && (
        <VideoSearchResults results={searchResults} onSelect={handleSelectVideo} />
      )}

      {!isSearching && searchResults.length === 0 && phase === 'idle' && !error && (
        <View style={styles.emptyState}>
          <MaterialIcons name="restaurant" size={64} color={placeholderColor as string} />
          <Text style={[styles.emptyTitle, { color: textColor }]}>
            Extract Recipes from YouTube
          </Text>
          <Text style={[styles.emptySubtitle, { color: placeholderColor as string }]}>
            Paste a YouTube URL or search for cooking videos to get started.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  searchButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
