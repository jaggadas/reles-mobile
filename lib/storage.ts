import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import type { GroceryItem, Ingredient, Recipe } from "./types";
import { aggregateIngredients } from "./aggregation";

const STORAGE_KEY = "reles_recipes";
const GROCERY_KEY = "reles_grocery_list";

function normalizeRecipe(recipe: Partial<Recipe>): Recipe {
  return {
    ...recipe,
    servings: recipe.servings ?? 0,
    prepTimeMinutes: recipe.prepTimeMinutes ?? 0,
    cookTimeMinutes: recipe.cookTimeMinutes ?? 0,
    allergens: recipe.allergens ?? [],
    caloriesKcal: recipe.caloriesKcal ?? 0,
    difficulty: recipe.difficulty ?? 0,
    cuisine: recipe.cuisine ?? "OTHER",
    highlights: recipe.highlights ?? [],
  } as Recipe;
}

async function getRecipes(): Promise<Recipe[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: Partial<Recipe>[] = JSON.parse(raw);
    return parsed.map(normalizeRecipe);
  } catch {
    return [];
  }
}

async function saveRecipes(recipes: Recipe[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

export async function insertRecipe(
  recipe: Omit<Recipe, "id" | "createdAt">
): Promise<string> {
  const recipes = await getRecipes();
  const id = uuidv4();
  const newRecipe: Recipe = {
    ...recipe,
    id,
    createdAt: new Date().toISOString(),
  };
  recipes.unshift(newRecipe);
  await saveRecipes(recipes);
  return id;
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const recipes = await getRecipes();
  return recipes.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const recipes = await getRecipes();
  return recipes.find((r) => r.id === id) ?? null;
}

export async function deleteRecipe(id: string): Promise<void> {
  const recipes = await getRecipes();
  await saveRecipes(recipes.filter((r) => r.id !== id));
}

export async function updateRecipe(
  id: string,
  updates: Partial<Omit<Recipe, "id" | "createdAt">>
): Promise<void> {
  const recipes = await getRecipes();
  const index = recipes.findIndex((r) => r.id === id);
  if (index === -1) return;
  recipes[index] = { ...recipes[index], ...updates };
  await saveRecipes(recipes);
}

export async function findRecipeByVideoId(videoId: string): Promise<Recipe | null> {
  const recipes = await getRecipes();
  return recipes.find((r) => r.videoId === videoId) ?? null;
}

// --- Grocery List ---

export async function getGroceryList(): Promise<GroceryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(GROCERY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveGroceryList(items: GroceryItem[]): Promise<void> {
  await AsyncStorage.setItem(GROCERY_KEY, JSON.stringify(items));
}

export async function setGroceryList(items: GroceryItem[]): Promise<void> {
  await saveGroceryList(items);
}

export async function addRecipeToGroceryList(
  recipeId: string,
  selectedIngredients?: Ingredient[]
): Promise<void> {
  const recipe = await getRecipeById(recipeId);
  if (!recipe) return;

  const ingredients = selectedIngredients ?? recipe.ingredients;
  const existing = await getGroceryList();

  const allInputs: {
    ingredient: Ingredient;
    recipeId: string;
    recipeTitle: string;
  }[] = [];

  for (const item of existing) {
    const nonRecipeSources = item.sources.filter(
      (s) => s.recipeId !== recipeId
    );
    if (nonRecipeSources.length === 0) continue;

    for (const source of nonRecipeSources) {
      allInputs.push({
        ingredient: { name: item.name, quantity: source.quantity },
        recipeId: source.recipeId,
        recipeTitle: source.recipeTitle,
      });
    }
  }

  for (const ing of ingredients) {
    allInputs.push({
      ingredient: ing,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
    });
  }

  const newList = aggregateIngredients(allInputs);

  const checkedNames = new Set(
    existing.filter((i) => i.checked).map((i) => i.name.toLowerCase())
  );
  for (const item of newList) {
    if (checkedNames.has(item.name.toLowerCase())) {
      item.checked = true;
    }
  }

  await saveGroceryList(newList);
}

export async function removeRecipeFromGroceryList(recipeId: string): Promise<void> {
  const existing = await getGroceryList();

  const updated: GroceryItem[] = [];

  for (const item of existing) {
    const remainingSources = item.sources.filter(
      (s) => s.recipeId !== recipeId
    );
    if (remainingSources.length === 0) continue;

    if (remainingSources.length < item.sources.length) {
      const inputs = remainingSources.map((s) => ({
        ingredient: { name: item.name, quantity: s.quantity } as Ingredient,
        recipeId: s.recipeId,
        recipeTitle: s.recipeTitle,
      }));
      const [reaggregated] = aggregateIngredients(inputs);
      if (reaggregated) {
        reaggregated.checked = item.checked;
        updated.push(reaggregated);
      }
    } else {
      updated.push(item);
    }
  }

  await saveGroceryList(updated);
}

export async function isRecipeInGroceryList(recipeId: string): Promise<boolean> {
  const list = await getGroceryList();
  return list.some((item) =>
    item.sources.some((s) => s.recipeId === recipeId)
  );
}

export async function getGroceryListRecipeIds(): Promise<Set<string>> {
  const ids = new Set<string>();
  const list = await getGroceryList();
  for (const item of list) {
    for (const source of item.sources) {
      ids.add(source.recipeId);
    }
  }
  return ids;
}

export async function toggleGroceryItemChecked(itemId: string): Promise<void> {
  const items = await getGroceryList();
  const index = items.findIndex((i) => i.id === itemId);
  if (index === -1) return;
  items[index].checked = !items[index].checked;
  await saveGroceryList(items);
}

export async function clearCheckedItems(): Promise<void> {
  const items = await getGroceryList();
  await saveGroceryList(items.filter((i) => !i.checked));
}

export async function removeGroceryItem(itemId: string): Promise<void> {
  const items = await getGroceryList();
  await saveGroceryList(items.filter((i) => i.id !== itemId));
}

export async function clearGroceryList(): Promise<void> {
  await saveGroceryList([]);
}

/** Clear all user-specific local data (recipes + grocery list). Call on logout. */
export async function clearAllUserData(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEY, GROCERY_KEY]);
}
