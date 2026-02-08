import type { GroceryItem, Ingredient } from "./types";
import { assignAisle } from "./aisles";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/e?s$/, ""); // naive depluralize: "onions" -> "onion", "tomatoes" -> "tomato"
}

interface ParsedQuantity {
  amount: number | null;
  unit: string;
  raw: string;
}

function parseQuantity(quantity: string): ParsedQuantity {
  const raw = quantity.trim();
  if (!raw) return { amount: null, unit: "", raw };

  // Match patterns like "2 cups", "1/2 tsp", "1.5 lbs"
  const match = raw.match(
    /^(\d+(?:[./]\d+)?)\s*(cups?|tbsp?|tsp?|tablespoons?|teaspoons?|lbs?|pounds?|oz|ounces?|cloves?|cans?|bunch(?:es)?|heads?|stalks?|pieces?|slices?|sprigs?|pinch(?:es)?|dash(?:es)?|handfuls?|sticks?|large|medium|small|whole)?(.*)$/i
  );

  if (!match) return { amount: null, unit: "", raw };

  let amount: number;
  const amountStr = match[1];
  if (amountStr.includes("/")) {
    const [num, den] = amountStr.split("/");
    amount = parseInt(num) / parseInt(den);
  } else {
    amount = parseFloat(amountStr);
  }

  const unit = (match[2] || "").toLowerCase().trim();
  return { amount, unit, raw };
}

function formatQuantity(amount: number, unit: string): string {
  let amountStr: string;
  if (Number.isInteger(amount)) {
    amountStr = amount.toString();
  } else {
    const fractions: Record<string, string> = {
      "0.25": "1/4",
      "0.33": "1/3",
      "0.5": "1/2",
      "0.67": "2/3",
      "0.75": "3/4",
    };
    const rounded = Math.round(amount * 100) / 100;
    const decimal = rounded - Math.floor(rounded);
    const decKey = decimal.toFixed(2);
    if (fractions[decKey] && Math.floor(rounded) === 0) {
      amountStr = fractions[decKey];
    } else if (fractions[decKey]) {
      amountStr = `${Math.floor(rounded)} ${fractions[decKey]}`;
    } else {
      amountStr = rounded.toString();
    }
  }

  if (unit && amount > 1) {
    const plurals: Record<string, string> = {
      cup: "cups",
      tbsp: "tbsp",
      tsp: "tsp",
      tablespoon: "tablespoons",
      teaspoon: "teaspoons",
      lb: "lbs",
      pound: "pounds",
      oz: "oz",
      ounce: "ounces",
      clove: "cloves",
      can: "cans",
      bunch: "bunches",
      head: "heads",
      stalk: "stalks",
      piece: "pieces",
      slice: "slices",
      sprig: "sprigs",
      stick: "sticks",
    };
    const singular = unit.replace(/e?s$/, "");
    const plural = plurals[singular] || plurals[unit] || unit;
    return `${amountStr} ${plural}`;
  }

  return unit ? `${amountStr} ${unit}` : amountStr;
}

export function aggregateIngredients(
  ingredients: { ingredient: Ingredient; recipeId: string; recipeTitle: string }[]
): GroceryItem[] {
  const grouped = new Map<
    string,
    {
      originalName: string;
      quantities: ParsedQuantity[];
      sources: { recipeId: string; recipeTitle: string; quantity: string }[];
    }
  >();

  for (const { ingredient, recipeId, recipeTitle } of ingredients) {
    const key = normalizeIngredientName(ingredient.name);
    if (!key) continue;

    const existing = grouped.get(key);
    const parsed = parseQuantity(ingredient.quantity);

    if (existing) {
      existing.quantities.push(parsed);
      existing.sources.push({
        recipeId,
        recipeTitle,
        quantity: ingredient.quantity,
      });
    } else {
      grouped.set(key, {
        originalName: ingredient.name,
        quantities: [parsed],
        sources: [{ recipeId, recipeTitle, quantity: ingredient.quantity }],
      });
    }
  }

  const items: GroceryItem[] = [];

  for (const [, group] of grouped) {
    let displayQuantity: string;

    if (group.quantities.length === 1) {
      displayQuantity = group.quantities[0].raw;
    } else {
      const byUnit = new Map<string, number>();
      let hasNullAmount = false;
      const rawParts: string[] = [];

      for (const q of group.quantities) {
        if (q.amount === null) {
          hasNullAmount = true;
          if (q.raw) rawParts.push(q.raw);
          continue;
        }
        const unitKey = q.unit || "__unitless__";
        byUnit.set(unitKey, (byUnit.get(unitKey) || 0) + q.amount);
      }

      if (hasNullAmount && byUnit.size === 0) {
        displayQuantity = rawParts[0] || "";
      } else {
        const parts: string[] = [];
        for (const [unit, total] of byUnit) {
          if (unit === "__unitless__") {
            parts.push(total.toString());
          } else {
            parts.push(formatQuantity(total, unit));
          }
        }
        if (hasNullAmount && rawParts.length > 0) {
          parts.push(...rawParts);
        }
        displayQuantity = parts.join(" + ");
      }
    }

    items.push({
      id: uuidv4(),
      name: group.originalName,
      displayQuantity,
      aisle: assignAisle(group.originalName),
      checked: false,
      sources: group.sources,
      addedAt: new Date().toISOString(),
    });
  }

  return items;
}
