import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { colors, spacing, radius, typography } from '@/constants/colors';
import { MetadataCard } from '@/components/MetadataCard';
import { Button, Tag } from '@/components/ui';
import { formatDifficulty, formatCuisine, formatAllergens } from '@/lib/format';
import { useRecipeDetail } from '@/hooks/useRecipeDetail';

export default function RecipeDetailScreen() {
  const {
    recipe,
    title,
    setTitle,
    instacartLoading,
    relatedVideos,
    loadingRelated,
    intersectingAllergens,
    handleTitleBlur,
    handleInstacart,
    handleDelete,
    handleUpdateIngredient,
    handleUpdateInstruction,
    router,
  } = useRecipeDetail();

  const bgColor = colors.background;
  const textColor = colors.text;
  const subtextColor = colors.textSecondary;
  const cardBg = colors.card;
  const borderColor = colors.borderLight;
  const primaryColor = colors.primary;
  const linkColor = colors.link;
  const allergenBg = colors.allergenBg;
  const allergenIcon = colors.allergenIcon;
  const allergenText = colors.allergenText;
  const stepCircle = colors.stepCircle;
  const errorColor = colors.deleteText;
  const textOnPrimary = colors.textOnPrimary;

  if (!recipe) {
    return (
      <View style={[styles.loading, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={primaryColor as string} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: recipe.title, headerBackTitle: 'Back', headerBackVisible: true }} />
      <ScrollView style={[styles.container, { backgroundColor: bgColor }]} contentContainerStyle={styles.content}>
        {/* TODO: IMAGE REPLACEMENT PENDING — Add branded header illustration here */}

        {/* Title */}
        <TextInput
          style={[styles.title, { color: textColor }]}
          value={title}
          onChangeText={setTitle}
          onBlur={handleTitleBlur}
          multiline
        />

        {/* Metadata */}
        <MetadataCard
          servings={recipe.servings}
          prepTimeMinutes={recipe.prepTimeMinutes}
          cookTimeMinutes={recipe.cookTimeMinutes}
          caloriesKcal={recipe.caloriesKcal}
        />

        {/* Details */}
        {(recipe.cuisine || recipe.difficulty || (recipe.allergens && recipe.allergens.length > 0)) && (
          <View style={[styles.detailsCard, { backgroundColor: cardBg, borderColor }]}>
            {recipe.cuisine && recipe.cuisine !== 'OTHER' && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: subtextColor }]}>Cuisine</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{formatCuisine(recipe.cuisine)}</Text>
              </View>
            )}
            {recipe.difficulty && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: subtextColor }]}>Difficulty</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{formatDifficulty(recipe.difficulty)}</Text>
              </View>
            )}
            {recipe.allergens && recipe.allergens.length > 0 && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: subtextColor }]}>Allergens</Text>
                <View style={[styles.allergenBadge, { backgroundColor: allergenBg }]}>
                  <MaterialIcons name="warning" size={13} color={allergenIcon as string} />
                  <Text style={[styles.allergenText, { color: allergenText }]}>
                    {formatAllergens(recipe.allergens)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Personalized allergen warning */}
        {intersectingAllergens.length > 0 && (
          <View style={[styles.warningCard, { backgroundColor: allergenBg, borderColor }]}>
            <View style={styles.warningHeader}>
              <MaterialIcons name="report-problem" size={18} color={allergenIcon as string} />
              <Text style={[styles.warningTitle, { color: allergenText }]}>
                Heads up – your allergens are present
              </Text>
            </View>
            <Text style={[styles.warningBody, { color: allergenText }]}>
              This recipe includes: {formatAllergens(intersectingAllergens)}.
            </Text>
          </View>
        )}

        {/* Highlights */}
        {recipe.highlights && recipe.highlights.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Things to know</Text>
            {recipe.highlights.map((h, idx) => (
              <View key={idx} style={styles.highlightRow}>
                <View style={[styles.highlightBullet, { backgroundColor: stepCircle }]}>
                  <Text style={[styles.highlightBulletText, { color: textOnPrimary }]}>•</Text>
                </View>
                <Text style={[styles.highlightText, { color: textColor }]}>{h}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Instacart */}
        <Button
          title="Order on Instacart"
          icon="shopping-bag"
          onPress={handleInstacart}
          variant="secondary"
          loading={instacartLoading}
          style={styles.instacartButton}
        />

        {/* Source video */}
        {recipe.videoId && (
          <Pressable
            onPress={() => Linking.openURL(recipe.url)}
            style={[styles.videoCard, { backgroundColor: cardBg, borderColor }]}
          >
            <Image source={{ uri: recipe.thumbnail }} style={styles.videoThumb} />
            <View style={styles.videoInfo}>
              <Text style={[styles.videoTitle, { color: textColor }]} numberOfLines={2}>
                {recipe.videoTitle || recipe.title}
              </Text>
              {recipe.channelTitle ? (
                <Text style={[styles.videoChannel, { color: subtextColor }]}>
                  {recipe.channelTitle}
                </Text>
              ) : null}
              <Text style={[styles.videoLink, { color: linkColor }]}>Watch on YouTube</Text>
            </View>
          </Pressable>
        )}

        {/* Related videos from other creators */}
        {(loadingRelated || relatedVideos.length > 0) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>More from other creators</Text>
            {loadingRelated && relatedVideos.length === 0 ? (
              <ActivityIndicator size="small" color={primaryColor as string} />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScroll}
              >
                {relatedVideos.map((video) => (
                  <Pressable
                    key={video.videoId}
                    style={styles.relatedCard}
                    onPress={() =>
                      router.navigate({
                        pathname: '/(tabs)',
                        params: { url: video.url },
                      })
                    }
                  >
                    <Image source={{ uri: video.thumbnail }} style={styles.relatedThumb} />
                    <Text style={[styles.relatedTitle, { color: textColor }]} numberOfLines={2}>
                      {video.title}
                    </Text>
                    <Text style={[styles.relatedChannel, { color: subtextColor }]} numberOfLines={1}>
                      {video.channelName}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Accompanying recipes */}
        {recipe.accompanyingRecipes && recipe.accompanyingRecipes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Goes Well With</Text>
            <View style={styles.companionList}>
              {recipe.accompanyingRecipes.map((name, i) => (
                <Pressable
                  key={i}
                  onPress={() => router.navigate({ pathname: '/(tabs)', params: { search: name } })}
                >
                  <Tag label={name} variant="outlined" />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Ingredients ({recipe.ingredients.length})
          </Text>
          {recipe.ingredients.map((ing, i) => (
            <View key={i} style={[styles.ingredientRow, { borderBottomColor: borderColor }]}>
              <TextInput
                style={[styles.ingredientQuantity, { color: subtextColor }]}
                value={ing.quantity}
                onChangeText={(v) => handleUpdateIngredient(i, 'quantity', v)}
              />
              <TextInput
                style={[styles.ingredientName, { color: textColor }]}
                value={ing.name}
                onChangeText={(v) => handleUpdateIngredient(i, 'name', v)}
              />
            </View>
          ))}
        </View>

        {/* Instructions */}
        {recipe.instructions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Instructions</Text>
            {recipe.instructions.map((step, i) => (
              <View key={i} style={styles.instructionRow}>
                <View style={[styles.stepNumber, { backgroundColor: stepCircle }]}>
                  <Text style={[styles.stepNumberText, { color: textOnPrimary }]}>{i + 1}</Text>
                </View>
                <TextInput
                  style={[styles.instructionText, { color: textColor }]}
                  value={step}
                  onChangeText={(v) => handleUpdateInstruction(i, v)}
                  multiline
                />
              </View>
            ))}
          </View>
        )}

        {/* Delete */}
        <Pressable onPress={handleDelete} style={styles.deleteLink}>
          <MaterialIcons name="delete-outline" size={16} color={errorColor as string} />
          <Text style={[styles.deleteLinkText, { color: errorColor }]}>Delete recipe</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.size['4xl'],
    fontWeight: typography.weight.bold,
    marginBottom: spacing.sm,
  },
  detailsCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginVertical: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  detailLabel: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
  },
  detailValue: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },
  allergenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  allergenText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  instacartButton: {
    marginBottom: spacing.sm,
  },
  videoCard: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginVertical: spacing.sm,
    borderWidth: 1,
  },
  videoThumb: {
    width: 120,
    height: 80,
  },
  videoInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  videoTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    marginBottom: 2,
  },
  videoChannel: {
    fontSize: typography.size.sm,
    marginBottom: 2,
  },
  videoLink: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    marginBottom: spacing.md,
  },
  companionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  ingredientQuantity: {
    width: 90,
    fontSize: typography.size.base,
    marginRight: spacing.sm,
  },
  ingredientName: {
    flex: 1,
    fontSize: typography.size.base,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: 10,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  instructionText: {
    flex: 1,
    fontSize: typography.size.base,
    lineHeight: 20,
  },
  deleteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xxl,
    paddingVertical: spacing.md,
  },
  deleteLinkText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
  },
  warningCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  warningTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },
  warningBody: {
    fontSize: typography.size.sm,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  highlightBullet: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  highlightBulletText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  highlightText: {
    flex: 1,
    fontSize: typography.size.sm,
    lineHeight: 18,
  },
  relatedScroll: {
    gap: spacing.md,
  },
  relatedCard: {
    width: 180,
    marginRight: spacing.md,
  },
  relatedThumb: {
    width: 180,
    height: 100,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  relatedTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  relatedChannel: {
    fontSize: typography.size.xs,
    marginTop: 2,
  },
});
