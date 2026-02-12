import { ImageSourcePropType } from "react-native";

export type FeatureSlide = {
  image: ImageSourcePropType;
  title?: string;
  subtitle: string;
  isLogo?: boolean;

};

export const FEATURE_SLIDES: FeatureSlide[] = [
  {
    image: require("@/assets/illustrations/save-and-organize.png"),
    subtitle: "Turn cooking videos into recipes you can actually\u00A0follow.",
    isLogo: true,
  },
  {
    image: require("@/assets/illustrations/saved-to-served.png"),
    title: "Saved to Served",
    subtitle:
      "Paste any YouTube link and get ingredients, steps, and timings \u2014 pulled out\u00A0automatically.",
  },
  {
    image: require("@/assets/illustrations/extract-recipes.png"),
    title: "Cooked For You",
    subtitle:
      "Personalized to your diet, allergens, and favorite cuisines. Every suggestion fits how\u00A0you\u00A0eat.",
  },
  {
    image: require("@/assets/illustrations/grocery.png"),
    title: "One Tap\nGrocery Lists",
    subtitle:
      "Turn any cooking video into a shopping list. Never forget an\u00A0ingredient\u00A0again.",
  },
];
