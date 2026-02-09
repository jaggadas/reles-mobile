export interface DishSuggestion {
  label: string;
  emoji: string;
  query: string;
}

export const CUISINE_SUGGESTIONS: Record<string, DishSuggestion[]> = {
  ITALIAN: [
    { label: "Cacio e Pepe", emoji: "🍝", query: "cacio e pepe recipe" },
    { label: "Tiramisu", emoji: "🍰", query: "tiramisu recipe" },
    { label: "Carbonara", emoji: "🥓", query: "spaghetti carbonara recipe" },
    { label: "Bruschetta", emoji: "🍅", query: "bruschetta recipe" },
    { label: "Risotto", emoji: "🍚", query: "mushroom risotto recipe" },
  ],
  JAPANESE: [
    { label: "Ramen", emoji: "🍜", query: "ramen recipe from scratch" },
    { label: "Sushi", emoji: "🍣", query: "sushi recipe at home" },
    { label: "Miso Soup", emoji: "🥣", query: "miso soup recipe" },
    { label: "Gyoza", emoji: "🥟", query: "gyoza dumplings recipe" },
    { label: "Teriyaki", emoji: "🍗", query: "chicken teriyaki recipe" },
  ],
  INDIAN: [
    { label: "Butter Chicken", emoji: "🍛", query: "butter chicken recipe" },
    { label: "Biryani", emoji: "🍚", query: "chicken biryani recipe" },
    { label: "Dal Makhani", emoji: "🫘", query: "dal makhani recipe" },
    { label: "Samosa", emoji: "🥟", query: "samosa recipe" },
    { label: "Paneer Tikka", emoji: "🧀", query: "paneer tikka recipe" },
  ],
  MEXICAN: [
    { label: "Tacos al Pastor", emoji: "🌮", query: "tacos al pastor recipe" },
    { label: "Guacamole", emoji: "🥑", query: "guacamole recipe" },
    { label: "Enchiladas", emoji: "🫔", query: "chicken enchiladas recipe" },
    { label: "Churros", emoji: "🍩", query: "churros recipe" },
    { label: "Elote", emoji: "🌽", query: "mexican elote recipe" },
  ],
  THAI: [
    { label: "Pad Thai", emoji: "🍜", query: "pad thai recipe" },
    { label: "Green Curry", emoji: "🍛", query: "thai green curry recipe" },
    { label: "Tom Yum", emoji: "🥣", query: "tom yum soup recipe" },
    { label: "Mango Sticky Rice", emoji: "🥭", query: "mango sticky rice recipe" },
    { label: "Satay", emoji: "🍢", query: "chicken satay recipe" },
  ],
  MEDITERRANEAN: [
    { label: "Hummus", emoji: "🫘", query: "hummus recipe" },
    { label: "Falafel", emoji: "🧆", query: "falafel recipe" },
    { label: "Greek Salad", emoji: "🥗", query: "greek salad recipe" },
    { label: "Shawarma", emoji: "🌯", query: "chicken shawarma recipe" },
    { label: "Baklava", emoji: "🍯", query: "baklava recipe" },
  ],
  CHINESE: [
    { label: "Kung Pao Chicken", emoji: "🍗", query: "kung pao chicken recipe" },
    { label: "Fried Rice", emoji: "🍚", query: "egg fried rice recipe" },
    { label: "Dumplings", emoji: "🥟", query: "chinese dumplings recipe" },
    { label: "Mapo Tofu", emoji: "🍲", query: "mapo tofu recipe" },
    { label: "Chow Mein", emoji: "🍜", query: "chow mein recipe" },
  ],
  AMERICAN: [
    { label: "Smash Burger", emoji: "🍔", query: "smash burger recipe" },
    { label: "Mac & Cheese", emoji: "🧀", query: "mac and cheese recipe" },
    { label: "BBQ Ribs", emoji: "🍖", query: "bbq ribs recipe" },
    { label: "Pancakes", emoji: "🥞", query: "fluffy pancakes recipe" },
    { label: "Apple Pie", emoji: "🥧", query: "apple pie recipe" },
  ],
  FRENCH: [
    { label: "Croissants", emoji: "🥐", query: "croissant recipe" },
    { label: "Ratatouille", emoji: "🍆", query: "ratatouille recipe" },
    { label: "Crêpes", emoji: "🥞", query: "french crepes recipe" },
    { label: "Quiche", emoji: "🥧", query: "quiche lorraine recipe" },
    { label: "Bouillabaisse", emoji: "🍲", query: "bouillabaisse recipe" },
  ],
  KOREAN: [
    { label: "Bibimbap", emoji: "🍚", query: "bibimbap recipe" },
    { label: "Kimchi Jjigae", emoji: "🍲", query: "kimchi jjigae recipe" },
    { label: "Bulgogi", emoji: "🥩", query: "bulgogi recipe" },
    { label: "Tteokbokki", emoji: "🍡", query: "tteokbokki recipe" },
    { label: "Korean Fried Chicken", emoji: "🍗", query: "korean fried chicken recipe" },
  ],
};

export function getSuggestionsForCuisines(
  likedCuisines: string[],
  count: number = 8
): DishSuggestion[] {
  const all: DishSuggestion[] = [];
  for (const cuisine of likedCuisines) {
    const key = cuisine.toUpperCase();
    if (CUISINE_SUGGESTIONS[key]) {
      all.push(...CUISINE_SUGGESTIONS[key]);
    }
  }
  const shuffled = all.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
