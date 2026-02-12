import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  type ViewToken,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui";
import { FEATURE_SLIDES } from "@/constants/features";
import { colors, spacing, radius, typography } from "@/constants/colors";

export default function WelcomeScreen() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === FEATURE_SLIDES.length - 1;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      router.replace("/(auth)/login");
    } else {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    }
  }, [activeIndex, isLastSlide, router]);

  const illustrationHeight = height * 0.45;

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
            <View style={[styles.illustrationContainer, { height: illustrationHeight, paddingTop: top }]}>
              <Image
                source={item.image}
                style={styles.illustration}
                contentFit="contain"
              />
            </View>

            <View style={styles.textContainer}>
              {item.isLogo ? (
                <Image
                  source={require("@/assets/images/Reles.svg")}
                  style={styles.logo}
                  contentFit="contain"
                />
              ) : (
                <Text style={styles.title}>{item.title}</Text>
              )}
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: bottom + spacing.xl }]}>
        <View style={styles.dots}>
          {FEATURE_SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === activeIndex ? colors.primary : colors.border,
                  width: i === activeIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Button
          title={isLastSlide ? "Get Started" : "Next"}
          onPress={handleNext}
          size="lg"
        />
      </View>
    </View>
  );
}

const f = typography.family;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBF2EB",
  },
  slide: {
    flex: 1,
  },
  illustrationContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  illustration: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing["3xl"],
    paddingBottom: spacing["3xl"],
  },
  logo: {
    width: 220,
    height: 72,
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.size["6xl"],
    fontFamily: f.headingBold,
    fontVariant: ["no-common-ligatures"],
    color: colors.primary,
    textAlign: "center",
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: f.heading,
    color: "#414141",
    textAlign: "center",
    lineHeight: 34,
    paddingHorizontal: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing["2xl"],
    gap: spacing.lg,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: radius.full,
  },
});
