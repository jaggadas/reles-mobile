import { ImageSourcePropType } from "react-native";

export type FeatureSlide = {
  image: ImageSourcePropType;
  title: string;
  subtitle: string;
};

export const FEATURE_SLIDES: FeatureSlide[] = [
  {
    image: require("@/assets/illustrations/saved-to-served.png"),
    title: "From Saved to Served",
    subtitle: "Turn any YouTube cooking video into a beautiful, step-by-step recipe.",
  },
  {
    image: require("@/assets/illustrations/extract-recipes.png"),
    title: "Extract Recipes",
    subtitle: "Paste a link, and we'll pull out ingredients, steps, and timings for you.",
  },
  {
    image: require("@/assets/illustrations/save-and-organize.png"),
    title: "Save & Organize",
    subtitle: "Build your personal cookbook. Search, filter, and cook anytime you want.",
  },
  {
    image: require("@/assets/illustrations/grocery.png"),
    title: "Smart Grocery Lists",
    subtitle: "Auto-generate shopping lists from any recipe. Never forget an ingredient.",
  },
];
