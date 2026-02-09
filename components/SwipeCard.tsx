import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import type { CuisineCard } from "@/constants/cuisines";
import { typography, radius, spacing } from "@/constants/colors";

const SWIPE_THRESHOLD = 120;

interface Props {
  card: CuisineCard;
  isTop: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export function SwipeCard({ card, isTop, onSwipeLeft, onSwipeRight }: Props) {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(width * 1.5, { damping: 15 });
        runOnJS(onSwipeRight)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-width * 1.5, { damping: 15 });
        runOnJS(onSwipeLeft)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-width / 2, 0, width / 2],
      [-15, 0, 15],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: card.color },
          animatedStyle,
        ]}
      >
        <Animated.View style={[styles.overlay, styles.likeOverlay, likeStyle]}>
          <Text style={styles.overlayText}>LIKE</Text>
        </Animated.View>
        <Animated.View style={[styles.overlay, styles.nopeOverlay, nopeStyle]}>
          <Text style={styles.overlayText}>NOPE</Text>
        </Animated.View>

        <Text style={styles.emoji}>{card.emoji}</Text>
        <Text style={styles.name}>{card.name}</Text>

        {/* TODO: IMAGE REPLACEMENT PENDING — replace emoji with cuisine photo */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Image replacement pending</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 300,
    height: 400,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  emoji: {
    fontSize: 72,
    marginBottom: spacing.md,
  },
  name: {
    fontSize: typography.size["4xl"],
    fontWeight: typography.weight.bold,
    color: "#FFFFFF",
  },
  overlay: {
    position: "absolute",
    top: spacing.xl,
    zIndex: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 3,
  },
  likeOverlay: {
    left: spacing.xl,
    borderColor: "#4CAF50",
  },
  nopeOverlay: {
    right: spacing.xl,
    borderColor: "#F44336",
  },
  overlayText: {
    fontSize: typography.size["3xl"],
    fontWeight: typography.weight.bold,
    color: "#FFFFFF",
  },
  placeholder: {
    position: "absolute",
    bottom: spacing.lg,
    opacity: 0.5,
  },
  placeholderText: {
    fontSize: typography.size.sm,
    color: "#FFFFFF",
    fontStyle: "italic",
  },
});
