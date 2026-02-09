import React, { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import { SwipeCard } from "./SwipeCard";
import type { CuisineCard } from "@/constants/cuisines";

interface Props {
  cards: CuisineCard[];
  onComplete: (liked: string[]) => void;
}

export function SwipeCardDeck({ cards, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);

  const handleSwipeRight = useCallback(() => {
    const card = cards[currentIndex];
    const newLiked = [...liked, card.category];

    if (currentIndex >= cards.length - 1) {
      onComplete(newLiked);
    } else {
      setLiked(newLiked);
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, cards, liked, onComplete]);

  const handleSwipeLeft = useCallback(() => {
    if (currentIndex >= cards.length - 1) {
      onComplete(liked);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, cards.length, liked, onComplete]);

  const remaining = cards.slice(currentIndex, currentIndex + 3);

  return (
    <View style={styles.container}>
      {remaining.reverse().map((card, i) => {
        const actualIndex = remaining.length - 1 - i;
        const isTop = actualIndex === 0;

        return (
          <View
            key={card.id}
            style={[
              styles.cardWrapper,
              {
                transform: [
                  { scale: 1 - actualIndex * 0.05 },
                  { translateY: actualIndex * -10 },
                ],
                zIndex: remaining.length - actualIndex,
              },
            ]}
          >
            <SwipeCard
              card={card}
              isTop={isTop}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
