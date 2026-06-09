import { sumCalories } from "@/lib/food-calories";

export type DietItemDisplay = {
  id: string;
  foodName: string;
  matchedName: string;
  servingLabel: string;
  caloriesPerServing: number;
  servings: number;
  totalCalories: number;
};

export function DietCalorieSummary({
  items,
  compact = false,
}: {
  items: DietItemDisplay[];
  compact?: boolean;
}) {
  if (items.length === 0) return null;

  const total = sumCalories(items);

  if (compact) {
    return (
      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
        {total} kcal
      </span>
    );
  }

  return (
    <div className="rounded-xl bg-orange-50/80 p-4 ring-1 ring-orange-100">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">식단 · 칼로리</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <div className="min-w-0">
              <p className="font-medium text-gray-900">
                {item.matchedName || item.foodName}
              </p>
              <p className="text-xs text-gray-500">
                {item.servingLabel}
                {item.servings !== 1 ? ` × ${item.servings}` : ""} ·{" "}
                {item.caloriesPerServing}kcal
              </p>
            </div>
            <span className="shrink-0 font-semibold text-orange-700">
              {item.totalCalories} kcal
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-orange-100 pt-3">
        <span className="text-sm font-medium text-gray-700">총 칼로리</span>
        <span className="text-base font-bold text-orange-800">{total} kcal</span>
      </div>
    </div>
  );
}
