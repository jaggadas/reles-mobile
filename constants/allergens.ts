import { ImageSourcePropType } from "react-native";

export type AllergenOption = {
  id: string;
  label: string;
  icon: ImageSourcePropType;
};

export const ALLERGEN_OPTIONS: AllergenOption[] = [
  { id: "dairy", label: "Dairy", icon: require("@/assets/icons/dairy.png") },
  { id: "gluten", label: "Gluten", icon: require("@/assets/icons/wheat.png") },
  { id: "eggs", label: "Eggs", icon: require("@/assets/icons/eggs.png") },
  { id: "nuts", label: "Tree Nuts", icon: require("@/assets/icons/treenuts.png") },
  { id: "peanuts", label: "Peanuts", icon: require("@/assets/icons/peanuts.png") },
  { id: "soy", label: "Soy", icon: require("@/assets/icons/soy.png") },
  { id: "shellfish", label: "Shellfish", icon: require("@/assets/icons/shellfish.png") },
  { id: "fish", label: "Fish", icon: require("@/assets/icons/fish.png") },
  { id: "sesame", label: "Sesame", icon: require("@/assets/icons/sesame.png") },
];
