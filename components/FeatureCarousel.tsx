import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  type ViewToken,
} from "react-native";
import { FEATURE_SLIDES } from "@/constants/features";
import { colors, spacing, radius, typography } from "@/constants/colors";

export function FeatureCarousel() {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const activeIndexRef = useRef(0);

  const subtextColor = colors.textSecondary;
  const dotActive = colors.primary;
  const dotInactive = colors.border;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        activeIndexRef.current = viewableItems[0].index;
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const scrollToNext = useCallback(() => {
    const next = (activeIndexRef.current + 1) % FEATURE_SLIDES.length;
    flatListRef.current?.scrollToIndex({ index: next, animated: true });
  }, []);

  useEffect(() => {
    const timer = setInterval(scrollToNext, 2000);
    return () => clearInterval(timer);
  }, [scrollToNext]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={FEATURE_SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={[styles.title, { color: dotActive }]}>
              {item.title}
            </Text>
            <Text style={[styles.subtitle, { color: subtextColor }]}>
              {item.subtitle}
            </Text>
            <Image
              source={item.image}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>
        )}
      />
      <View style={styles.dots}>
        {FEATURE_SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i === activeIndex ? dotActive : dotInactive,
                width: i === activeIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const f = typography.family;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing["3xl"],
  },
  illustration: {
    width: 280,
    height: 280,
    marginTop: spacing.md,
  },
  title: {
    fontSize: typography.size["3xl"],
    fontFamily: f.headingBold,
    fontVariant: ['no-common-ligatures'],
    textAlign: "center",
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.size.base,
    fontFamily: f.body,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  dot: {
    height: 8,
    borderRadius: radius.full,
  },
});
