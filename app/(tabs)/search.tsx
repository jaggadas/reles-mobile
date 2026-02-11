import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ExtractionCard } from '@/components/ExtractionCard';
import { VideoSearchResults } from '@/components/VideoSearchResults';
import { colors, radius, spacing, typography } from '@/constants/colors';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useRecipeSearch, type DietFilter } from '@/hooks/useRecipeSearch';

// ── Diet filter config ────────────────────────────────────────────

const DIET_FILTERS: {
  value: DietFilter;
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  activeBg: string;
  activeBorder: string;
  activeColor: string;
}[] = [
  { value: 'veg',    label: 'Veg',     icon: 'eco',        activeBg: '#E8F5E9', activeBorder: '#A5D6A7', activeColor: '#2E7D32' },
  { value: 'nonveg', label: 'Non-Veg', icon: 'restaurant', activeBg: '#FBE9E7', activeBorder: '#FFAB91', activeColor: '#BF360C' },
  { value: 'vegan',  label: 'Vegan',   icon: 'spa',        activeBg: '#E0F2F1', activeBorder: '#80CBC4', activeColor: '#00695C' },
];

// ── Component ────────────────────────────────────────────────────

export default function SearchScreen() {
  const {
    query,
    setQuery,
    searchResults,
    setSearchResults,
    phase,
    error,
    setError,
    isSearching,
    dietFilter,
    setDietFilter,
    inputRef,
    trendingSearches,
    showIdle,
    handleSearch,
    handleSelectVideo,
    handleSuggestionPress,
  } = useRecipeSearch();

  const { remainingExtractions, weeklyLimit, isPro, isTrialActive, showPaywall } = useSubscription();

  // ── Colors ──
  const textColor = colors.text;
  const subtextColor = colors.textSecondary;
  const inputBg = colors.inputBackground;
  const placeholderColor = colors.textMuted;
  const primaryColor = colors.primary;
  const primaryTextColor = colors.textOnPrimary;
  const borderColor = colors.borderLight;
  const categoryBg = colors.categoryBg;

  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View style={styles.container}>
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

      {/* Diet filter */}
      <View style={styles.dietFilterRow}>
        {DIET_FILTERS.map((f) => {
          const active = dietFilter === f.value;
          return (
            <Pressable
              key={f.value}
              onPress={() => setDietFilter(active ? 'all' : f.value)}
              style={[
                styles.dietFilterButton,
                { backgroundColor: active ? f.activeBg : colors.categoryBg, borderColor: active ? f.activeBorder : colors.borderLight },
              ]}
            >
              <MaterialIcons name={f.icon} size={14} color={active ? f.activeColor : (subtextColor as string)} />
              <Text style={[styles.dietFilterLabel, { color: active ? f.activeColor : subtextColor }]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Extraction quota banner */}
      <View style={[styles.quotaBanner, !isPro && styles.quotaBannerFree]}>
        <View style={styles.quotaLeft}>
          <View style={styles.quotaCountRow}>
            <Text style={styles.quotaCount}>{remainingExtractions}</Text>
            <Text style={styles.quotaOf}>/{weeklyLimit}</Text>
          </View>
          <Text style={[styles.quotaLabel, { color: subtextColor }]}>
            {isPro ? 'recipes left · Pro' : isTrialActive ? 'recipes left · Trial' : 'recipes left this week'}
          </Text>
        </View>
        {!isPro && (
          <Pressable
            onPress={() => showPaywall()}
            style={({ pressed }) => [
              styles.quotaUpgradeButton,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <MaterialIcons name="bolt" size={16} color="#FFFFFF" />
            <Text style={styles.quotaUpgradeText}>Go Pro</Text>
          </Pressable>
        )}
      </View>

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

      {/* Idle state: suggestions */}
      {showIdle && (
        <ScrollView
          contentContainerStyle={[styles.idleContent, { paddingBottom: tabBarHeight }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.idleCenter}>
            <MaterialIcons name="search" size={48} color={colors.borderLight} />
            <Text style={[styles.idleTitle, { color: textColor }]}>
              Find your next recipe
            </Text>
            <Text style={[styles.idleSubtitle, { color: subtextColor }]}>
              Search for recipes or paste a YouTube URL
            </Text>
          </View>

          <View style={styles.suggestionsSection}>
            <Text style={[styles.suggestionsLabel, { color: subtextColor }]}>
              Trending searches
            </Text>
            <View style={styles.suggestionsWrap}>
              {trendingSearches.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => handleSuggestionPress(item.query)}
                  style={({ pressed }) => [
                    styles.suggestionChip,
                    {
                      backgroundColor: categoryBg as string,
                      borderColor: borderColor as string,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <MaterialIcons name="trending-up" size={14} color={subtextColor as string} />
                  <Text style={[styles.suggestionLabel, { color: subtextColor }]}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
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

  // Search
  searchContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
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
    fontFamily: f.body,
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

  // Diet filter
  dietFilterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  dietFilterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  dietFilterLabel: {
    fontFamily: f.bodySemibold,
    fontSize: typography.size.sm,
  },

  // Quota banner
  quotaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  quotaBannerFree: {
    backgroundColor: '#FFFAF6',
    borderColor: colors.primary,
  },
  quotaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quotaCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  quotaCount: {
    fontFamily: f.headingBold,
    fontSize: typography.size['2xl'],
    color: colors.primary,
  },
  quotaOf: {
    fontFamily: f.body,
    fontSize: typography.size.base,
    color: colors.primary,
    opacity: 0.6,
  },
  quotaLabel: {
    fontFamily: f.body,
    fontSize: typography.size.sm,
  },
  quotaUpgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  quotaUpgradeText: {
    fontFamily: f.bodySemibold,
    fontSize: typography.size.base,
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
  idleContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  idleCenter: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  idleTitle: {
    fontFamily: f.headingBold,
    fontSize: typography.size['2xl'],
    letterSpacing: -0.2,
    marginTop: spacing.md,
  },
  idleSubtitle: {
    fontFamily: f.body,
    fontSize: typography.size.base,
    textAlign: 'center',
  },
  suggestionsSection: {
    gap: spacing.md,
  },
  suggestionsLabel: {
    fontFamily: f.bodySemibold,
    fontSize: typography.size.base,
  },
  suggestionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  suggestionLabel: {
    fontFamily: f.bodyMedium,
    fontSize: typography.size.sm,
  },
});
