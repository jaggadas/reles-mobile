import type { AisleCategory } from "./types";

export const AISLE_KEYWORDS: Record<AisleCategory, string[]> = {
  produce: [
    "onion", "garlic", "tomato", "lettuce", "carrot", "celery", "pepper",
    "potato", "lemon", "lime", "apple", "banana", "avocado", "cilantro",
    "parsley", "basil", "ginger", "mushroom", "spinach", "kale", "broccoli",
    "zucchini", "cucumber", "jalapeño", "jalapeno", "scallion", "shallot",
    "corn", "cabbage", "asparagus", "beet", "radish", "squash", "pea",
    "green bean", "bell pepper", "chili", "herb", "mint", "dill", "chive",
    "leek", "fennel", "arugula", "romaine", "bok choy", "eggplant",
    "sweet potato", "mango", "pineapple", "berry", "strawberry", "blueberry",
    "raspberry", "grape", "peach", "pear", "orange", "grapefruit", "melon",
    "watermelon",
  ],
  "meat-seafood": [
    "chicken", "beef", "pork", "lamb", "turkey", "bacon", "sausage",
    "ground", "steak", "salmon", "shrimp", "fish", "tuna", "cod",
    "tilapia", "crab", "lobster", "scallop", "prosciutto", "pancetta",
    "ham", "ribs", "brisket", "meatball", "anchovy",
  ],
  "dairy-eggs": [
    "milk", "cream", "butter", "cheese", "yogurt", "egg", "sour cream",
    "cream cheese", "parmesan", "mozzarella", "cheddar", "feta", "ricotta",
    "half and half", "whipping cream", "heavy cream", "gruyere",
    "gouda", "brie", "mascarpone", "ghee",
  ],
  bakery: [
    "bread", "tortilla", "bun", "roll", "pita", "naan", "croissant",
    "bagel", "english muffin", "flatbread", "ciabatta", "sourdough",
  ],
  frozen: ["frozen", "ice cream"],
  pantry: [
    "flour", "sugar", "rice", "pasta", "noodle", "bean", "lentil",
    "chickpea", "oat", "cereal", "broth", "stock", "canned",
    "tomato paste", "coconut milk", "olive oil", "vegetable oil",
    "vinegar", "honey", "maple syrup", "peanut butter", "bread crumb",
    "cornstarch", "baking", "sesame oil", "soy", "panko", "almond",
    "walnut", "pecan", "pine nut", "cashew", "pistachio", "coconut",
    "chocolate", "cocoa", "vanilla", "brown sugar", "powdered sugar",
    "molasses", "agave", "tahini", "miso",
  ],
  "spices-seasonings": [
    "salt", "pepper", "cumin", "paprika", "oregano", "thyme", "rosemary",
    "cinnamon", "nutmeg", "cayenne", "chili powder", "garlic powder",
    "onion powder", "bay leaf", "curry", "turmeric", "coriander",
    "cardamom", "clove", "allspice", "mustard powder", "red pepper flake",
    "italian seasoning", "everything bagel", "za'atar", "sumac",
    "smoked paprika", "saffron", "star anise", "five spice",
  ],
  "condiments-sauces": [
    "ketchup", "mustard", "mayo", "mayonnaise", "soy sauce", "hot sauce",
    "sriracha", "worcestershire", "bbq sauce", "salsa", "ranch",
    "dressing", "fish sauce", "oyster sauce", "hoisin", "teriyaki",
    "buffalo sauce", "pesto", "marinara", "enchilada sauce",
  ],
  beverages: ["wine", "beer", "juice", "coffee", "tea", "broth"],
  other: [],
};

export const AISLE_ORDER: AisleCategory[] = [
  "produce",
  "bakery",
  "meat-seafood",
  "dairy-eggs",
  "frozen",
  "pantry",
  "spices-seasonings",
  "condiments-sauces",
  "beverages",
  "other",
];

export const AISLE_LABELS: Record<AisleCategory, string> = {
  produce: "Produce",
  "meat-seafood": "Meat & Seafood",
  "dairy-eggs": "Dairy & Eggs",
  bakery: "Bakery",
  frozen: "Frozen",
  pantry: "Pantry",
  "spices-seasonings": "Spices & Seasonings",
  "condiments-sauces": "Condiments & Sauces",
  beverages: "Beverages",
  other: "Other",
};

export const AISLE_EMOJI: Record<AisleCategory, string> = {
  produce: "\u{1F96C}",
  "meat-seafood": "\u{1F969}",
  "dairy-eggs": "\u{1F95A}",
  bakery: "\u{1F35E}",
  frozen: "\u{1F9CA}",
  pantry: "\u{1FAD9}",
  "spices-seasonings": "\u{1F9C2}",
  "condiments-sauces": "\u{1FAD7}",
  beverages: "\u{1F964}",
  other: "\u{1F4E6}",
};

export function assignAisle(ingredientName: string): AisleCategory {
  const normalized = ingredientName.toLowerCase();

  for (const [aisle, keywords] of Object.entries(AISLE_KEYWORDS)) {
    if (aisle === "other") continue;
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return aisle as AisleCategory;
    }
  }

  return "other";
}
