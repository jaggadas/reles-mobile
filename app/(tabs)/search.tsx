import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VideoSearchResults } from '@/components/VideoSearchResults';
import { colors, radius, spacing, typography } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useRecipeSearch } from '@/hooks/useRecipeSearch';

// ── Component ────────────────────────────────────────────────────

export default function SearchScreen() {
  const {
    query,
    setQuery,
    searchResults,
    setSearchResults,
    error,
    isSearching,
    inputRef,
    showIdle,
    handleSearch,
    handleSelectVideo,
  } = useRecipeSearch();

  // ── Colors ──
  const textColor = colors.text;
  const subtextColor = colors.textSecondary;
  const primaryColor = colors.primary;

  const { top: safeTop } = useSafeAreaInsets();
  const { user } = useAuth();

  // ── Greeting collapse animation ──
  const greetingName = user?.name?.split(' ')[0] || 'Chef';
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12)
      return { greeting: `Good morning, ${greetingName}`, subtitle: 'What should we cook today?' };
    if (hour >= 12 && hour < 17)
      return { greeting: `Good afternoon, ${greetingName}`, subtitle: 'Looking for lunch ideas?' };
    if (hour >= 17 && hour < 22)
      return { greeting: `Good evening, ${greetingName}`, subtitle: 'Time to make something delicious' };
    return { greeting: `Late night cooking, ${greetingName}?`, subtitle: "Let's find a midnight snack" };
  }, [greetingName]);

  const collapseProgress = useSharedValue(1);

  useFocusEffect(
    useCallback(() => {
      collapseProgress.value = 0;
      collapseProgress.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) });
    }, []),
  );

  const greetingAnimStyle = useAnimatedStyle(() => ({
    opacity: 1 - collapseProgress.value,
    maxHeight: (1 - collapseProgress.value) * 80,
    overflow: 'hidden' as const,
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBorder}>
      <View style={[styles.header, { paddingTop: safeTop + spacing.lg }]}>
        <Image
          source={require('@/assets/illustrations/extract recipes.png')}
          style={styles.headerIllustration}
          contentFit="cover"
        />
        <Image
          source={require('@/assets/images/Reles.svg')}
          style={styles.logo}
          contentFit="contain"
          tintColor="#FFFFFF"
        />

        {/* Greeting – collapses on mount */}
        <Animated.View style={[styles.greetingContainer, greetingAnimStyle]}>
          <Text style={styles.greetingText}>{greeting.greeting}</Text>
          <Text style={styles.greetingSubtext}>{greeting.subtitle}</Text>
        </Animated.View>

        {/* Search bar */}
        <View style={styles.inputWrapper}>
          <MaterialIcons name="search" size={20} color="rgba(255,255,255,0.5)" />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); setSearchResults([]); }}>
              <MaterialIcons name="close" size={20} color="rgba(255,255,255,0.5)" />
            </Pressable>
          )}
        </View>
      </View>
      </View>

      {/* Loading state */}
      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor as string} />
          <Text style={[styles.loadingText, { color: subtextColor }]}>Searching recipes...</Text>
        </View>
      )}

      {/* Search error */}
      {error && searchResults.length === 0 && !isSearching && (
        <View style={styles.loadingContainer}>
          <MaterialIcons name="search-off" size={32} color={colors.textMuted} />
          <Text style={[styles.loadingText, { color: subtextColor }]}>{error}</Text>
        </View>
      )}

      {/* Search results */}
      {searchResults.length > 0 && (
        <VideoSearchResults results={searchResults} onSelect={handleSelectVideo} />
      )}

      {/* Idle state */}
      {showIdle && (
        <View style={styles.idleCenter}>
          <MaterialIcons name="search" size={48} color={colors.borderLight} />
          <Text style={[styles.idleTitle, { color: textColor }]}>
            Find your next recipe
          </Text>
          <Text style={[styles.idleSubtitle, { color: subtextColor }]}>
            Search for recipes or paste a YouTube URL
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const f = typography.family;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  headerBorder: {
    backgroundColor: '#E5CCA9',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 1,
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
  },
  logo: {
    width: 140,
    height: 48,
    marginLeft: -24,
  },

  // Greeting
  greetingContainer: {
    paddingTop: spacing.md,
  },
  greetingText: {
    fontFamily: f.heading,
    fontSize: typography.size['4xl'],
    fontVariant: ['no-common-ligatures'],
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
  greetingSubtext: {
    fontFamily: f.body,
    fontSize: typography.size.lg,
    marginTop: spacing.xs,
    color: 'rgba(255,255,255,0.7)',
  },

  // Search
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: f.body,
    fontSize: typography.size.lg,
    height: '100%',
    color: '#FFFFFF',
  },
  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: f.body,
    fontSize: typography.size.lg,
  },

  // Idle state
  idleCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginTop: -spacing.xxl,
  },
  idleTitle: {
    fontFamily: f.headingBold,
    fontSize: typography.size['2xl'],
    fontVariant: ['no-common-ligatures'],
    letterSpacing: -0.2,
    marginTop: spacing.md,
  },
  idleSubtitle: {
    fontFamily: f.body,
    fontSize: typography.size.base,
    textAlign: 'center',
  },
});
