import { ImageSourcePropType } from "react-native";

export type DietaryOption = {
  id: string;
  label: string;
  image: ImageSourcePropType;
};

export const DIETARY_OPTIONS: DietaryOption[] = [
  { id: "vegetarian", label: "Vegetarian", image: require("@/assets/illustrations/veg.png") },
  { id: "vegan", label: "Vegan", image: require("@/assets/illustrations/vegan.png") },
  { id: "none", label: "Non-Veg", image: require("@/assets/illustrations/chicken.png") },
];

export const FOOD_CATEGORIES = [
  { id: "pasta", label: "Pasta", emoji: "🍝" },
  { id: "curry", label: "Curry", emoji: "🍛" },
  { id: "baking", label: "Baking", emoji: "🧁" },
  { id: "grilling", label: "Grilling", emoji: "🥩" },
  { id: "salads", label: "Salads", emoji: "🥗" },
  { id: "soups", label: "Soups", emoji: "🍲" },
  { id: "seafood", label: "Seafood", emoji: "🦐" },
  { id: "breakfast", label: "Breakfast", emoji: "🥞" },
  { id: "desserts", label: "Desserts", emoji: "🍰" },
  { id: "stir-fry", label: "Stir Fry", emoji: "🥘" },
  { id: "sandwiches", label: "Sandwiches", emoji: "🥪" },
  { id: "smoothies", label: "Smoothies", emoji: "🥤" },
] as const;
