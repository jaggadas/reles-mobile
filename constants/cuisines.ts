import type { CuisineCategory } from "@/lib/types";
import { palette } from "./colors";

export interface CuisineCard {
  id: string;
  name: string;
  category: CuisineCategory;
  color: string;
  emoji: string;
}

export const CUISINE_CARDS: CuisineCard[] = [
  {
    id: "italian",
    name: "Italian",
    category: "ITALIAN",
    color: palette.terracotta,
    emoji: "🍝",
  },
  {
    id: "japanese",
    name: "Japanese",
    category: "JAPANESE",
    color: palette.darkTeal,
    emoji: "🍱",
  },
  {
    id: "indian",
    name: "Indian",
    category: "INDIAN",
    color: palette.orange,
    emoji: "🍛",
  },
  {
    id: "mexican",
    name: "Mexican",
    category: "MEXICAN",
    color: palette.olive,
    emoji: "🌮",
  },
  {
    id: "thai",
    name: "Thai",
    category: "THAI",
    color: palette.burgundy,
    emoji: "🍜",
  },
  {
    id: "mediterranean",
    name: "Mediterranean",
    category: "MEDITERRANEAN",
    color: palette.darkTealLight,
    emoji: "🥗",
  },
  {
    id: "chinese",
    name: "Chinese",
    category: "CHINESE",
    color: palette.deepRed,
    emoji: "🥡",
  },
  {
    id: "american",
    name: "American",
    category: "AMERICAN",
    color: palette.burgundyDark,
    emoji: "🍔",
  },
];
