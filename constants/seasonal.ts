export interface SeasonalItem {
  label: string;
  emoji: string;
  query: string;
}

export interface SeasonConfig {
  name: string;
  subtitle: string;
  emoji: string;
  items: SeasonalItem[];
}

const SEASONS: Record<string, SeasonConfig> = {
  winter: {
    name: "Winter",
    subtitle: "Warm up with these",
    emoji: "❄️",
    items: [
      { label: "Hearty Stew", emoji: "🍲", query: "hearty beef stew recipe" },
      { label: "Hot Chocolate", emoji: "☕", query: "hot chocolate recipe" },
      { label: "Pot Pie", emoji: "🥧", query: "chicken pot pie recipe" },
      { label: "French Onion Soup", emoji: "🧅", query: "french onion soup recipe" },
      { label: "Chili", emoji: "🌶️", query: "chili con carne recipe" },
      { label: "Shepherd's Pie", emoji: "🥘", query: "shepherds pie recipe" },
    ],
  },
  spring: {
    name: "Spring",
    subtitle: "Fresh and light",
    emoji: "🌸",
    items: [
      { label: "Spring Rolls", emoji: "🥗", query: "fresh spring rolls recipe" },
      { label: "Lemon Pasta", emoji: "🍋", query: "lemon pasta recipe" },
      { label: "Asparagus Risotto", emoji: "🍚", query: "asparagus risotto recipe" },
      { label: "Berry Salad", emoji: "🍓", query: "mixed berry salad recipe" },
      { label: "Herb Chicken", emoji: "🌿", query: "herb roasted chicken recipe" },
      { label: "Pea Soup", emoji: "🥣", query: "spring pea soup recipe" },
    ],
  },
  summer: {
    name: "Summer",
    subtitle: "Cool and refreshing",
    emoji: "☀️",
    items: [
      { label: "Grilled Fish", emoji: "🐟", query: "grilled fish recipe" },
      { label: "Watermelon Salad", emoji: "🍉", query: "watermelon feta salad recipe" },
      { label: "Gazpacho", emoji: "🍅", query: "gazpacho recipe" },
      { label: "Mango Lassi", emoji: "🥭", query: "mango lassi recipe" },
      { label: "Ceviche", emoji: "🍤", query: "shrimp ceviche recipe" },
      { label: "Ice Cream", emoji: "🍦", query: "homemade ice cream recipe" },
    ],
  },
  fall: {
    name: "Fall",
    subtitle: "Cozy autumn flavors",
    emoji: "🍂",
    items: [
      { label: "Pumpkin Soup", emoji: "🎃", query: "pumpkin soup recipe" },
      { label: "Apple Pie", emoji: "🥧", query: "apple pie recipe from scratch" },
      { label: "Butternut Pasta", emoji: "🍝", query: "butternut squash pasta recipe" },
      { label: "Chai Latte", emoji: "☕", query: "chai latte recipe" },
      { label: "Mushroom Risotto", emoji: "🍄", query: "wild mushroom risotto recipe" },
      { label: "Cinnamon Rolls", emoji: "🍩", query: "cinnamon rolls recipe" },
    ],
  },
};

export function getCurrentSeason(): SeasonConfig {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return SEASONS.spring;
  if (month >= 5 && month <= 7) return SEASONS.summer;
  if (month >= 8 && month <= 10) return SEASONS.fall;
  return SEASONS.winter;
}
