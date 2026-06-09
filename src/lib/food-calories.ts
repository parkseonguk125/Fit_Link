import { FOOD_DATABASE } from "./food-database";
import type { FoodDefinition, FoodLookupResult } from "./food-calories-types";

export type { FoodDefinition, FoodLookupResult } from "./food-calories-types";

function normalize(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, "");
}

function scoreMatch(query: string, candidate: string) {
  if (query === candidate) return 100;
  if (candidate.startsWith(query)) return 80;
  if (query.startsWith(candidate)) return 70;
  if (candidate.includes(query)) return 50;
  if (query.includes(candidate)) return 40;
  return 0;
}

function findBestMatch(input: string): FoodDefinition | null {
  const query = normalize(input);
  if (!query) return null;

  let best: { food: FoodDefinition; score: number } | null = null;

  for (const food of FOOD_DATABASE) {
    const candidates = [food.name, ...food.aliases];
    for (const candidate of candidates) {
      const score = scoreMatch(query, normalize(candidate));
      if (score > 0 && (!best || score > best.score)) {
        best = { food, score };
      }
    }
  }

  return best?.food ?? null;
}

export function lookupFood(input: string): FoodLookupResult | null {
  const food = findBestMatch(input);
  if (!food) return null;
  return toResult(food, input);
}

export function searchFoodSuggestions(input: string, limit = 8): FoodDefinition[] {
  const query = normalize(input);
  if (!query) return [];

  const scored = FOOD_DATABASE.map((food) => {
    let maxScore = scoreMatch(query, normalize(food.name));
    for (const alias of food.aliases) {
      maxScore = Math.max(maxScore, scoreMatch(query, normalize(alias)));
    }
    return { food, score: maxScore };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const unique: FoodDefinition[] = [];
  for (const entry of scored) {
    if (unique.some((item) => item.name === entry.food.name)) continue;
    unique.push(entry.food);
    if (unique.length >= limit) break;
  }

  return unique;
}

function toResult(food: FoodDefinition, input: string): FoodLookupResult {
  return {
    foodName: input.trim(),
    matchedName: food.name,
    servingLabel: food.servingLabel,
    caloriesPerServing: food.caloriesPerServing,
  };
}

export function sumCalories(items: { totalCalories: number }[]) {
  return items.reduce((sum, item) => sum + item.totalCalories, 0);
}
