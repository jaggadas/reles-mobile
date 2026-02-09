import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  type ViewToken,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FEATURE_SLIDES } from "@/constants/features";
import { colors, spacing, radius, typography } from "@/constants/colors";
import { useThemeColor } from "@/hooks/use-theme-color";

export function FeatureCarousel() {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const textColor = useThemeColor(
    { light: colors.light.text, dark: colors.dark.text },
    "text"
  );
  const subtextColor = useThemeColor(
    { light: colors.light.textSecondary, dark: colors.dark.textSecondary },
    "text"
  );
  const dotActive = useThemeColor(
    { light: colors.light.primary, dark: colors.dark.primary },
    "tint"
  );
  const dotInactive = useThemeColor(
    { light: colors.light.border, dark: colors.dark.border },
    "text"
  );
  const primaryLight = useThemeColor(
    { light: colors.light.primaryLight, dark: colors.dark.primaryLight },
    "background"
  );
  const iconColor = useThemeColor(
    { light: colors.light.primary, dark: colors.dark.primary },
    "tint"
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  return (
    <View style={styles.container}>
      <FlatList
        data={FEATURE_SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconCircle, { backgroundColor: primaryLight }]}>
              <MaterialIcons
                name={item.icon as any}
                size={44}
                color={iconColor as string}
              />
            </View>
            <Text style={[styles.title, { color: textColor }]}>
              {item.title}
            </Text>
            <Text style={[styles.subtitle, { color: subtextColor }]}>
              {item.subtitle}
            </Text>
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
                  i === activeIndex ? (dotActive as string) : (dotInactive as string),
                width: i === activeIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

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
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing["2xl"],
  },
  title: {
    fontSize: typography.size["5xl"],
    fontWeight: typography.weight.bold,
    textAlign: "center",
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.size.xl,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: radius.full,
  },
});
