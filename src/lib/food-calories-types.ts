export type FoodDefinition = {
  name: string;
  aliases: string[];
  servingLabel: string;
  caloriesPerServing: number;
};

export type FoodLookupResult = {
  foodName: string;
  matchedName: string;
  servingLabel: string;
  caloriesPerServing: number;
};
