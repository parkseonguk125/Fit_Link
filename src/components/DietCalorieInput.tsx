"use client";

import { useMemo, useState } from "react";
import {
  lookupFood,
  searchFoodSuggestions,
  sumCalories,
  type FoodLookupResult,
} from "@/lib/food-calories";
import { createClientId } from "@/lib/create-id";

export type DietItemDraft = FoodLookupResult & {
  id: string;
  servings: number;
  totalCalories: number;
};

type DietCalorieInputProps = {
  items: DietItemDraft[];
  onChange: (items: DietItemDraft[]) => void;
};

export function DietCalorieInput({ items, onChange }: DietCalorieInputProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const suggestions = useMemo(
    () => searchFoodSuggestions(input, 5),
    [input],
  );

  const total = sumCalories(items);

  function addFood(name?: string) {
    try {
      const value = (name ?? input).trim();
      if (!value) {
        setError("음식 이름을 입력해 주세요.");
        return;
      }

      const matched = lookupFood(value);
      if (!matched) {
        setError(`"${value}" 은(는) 목록에 없어요. 다른 이름으로 입력해 보세요.`);
        return;
      }

      const servings = 1;
      onChange([
        ...items,
        {
          ...matched,
          id: createClientId(),
          servings,
          totalCalories: Math.round(matched.caloriesPerServing * servings),
        },
      ]);
      setInput("");
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "음식 추가 중 오류가 발생했습니다.",
      );
    }
  }

  function updateServings(id: string, servings: number) {
    const next = Math.max(0.5, Math.min(10, servings));
    onChange(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              servings: next,
              totalCalories: Math.round(item.caloriesPerServing * next),
            }
          : item,
      ),
    );
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="mb-1 text-sm font-medium text-gray-700">식단 · 칼로리</p>
      <p className="mb-3 text-xs text-gray-500">
        음식 이름을 입력하면 표준 1회 제공량 기준 칼로리가 계산됩니다.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addFood();
            }
          }}
          placeholder="예: 닭가슴살, 현미밥, 방울토마토"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#4A90A4]"
        />
        <button
          type="button"
          onClick={() => addFood()}
          className="shrink-0 rounded-xl bg-[#4A90A4] px-4 text-sm font-semibold text-white"
        >
          추가
        </button>
      </div>

      {suggestions.length > 0 && input.trim() ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.map((food) => (
            <button
              key={food.name}
              type="button"
              onClick={() => addFood(food.name)}
              className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
            >
              {food.name}
            </button>
          ))}
        </div>
      ) : null}

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

      {items.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl bg-[#F8F9FA] px-3 py-2.5 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">
                    {item.matchedName || item.foodName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.servingLabel} · {item.caloriesPerServing}kcal
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label="삭제"
                  className="shrink-0 text-xs text-gray-400 hover:text-red-500"
                >
                  삭제
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">인분</span>
                  <button
                    type="button"
                    onClick={() => updateServings(item.id, item.servings - 0.5)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.servings}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateServings(item.id, item.servings + 0.5)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200"
                  >
                    +
                  </button>
                </div>
                <span className="font-semibold text-[#4A90A4]">
                  {item.totalCalories} kcal
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {items.length > 0 ? (
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
          <span className="text-sm font-medium text-gray-700">총 칼로리</span>
          <span className="text-lg font-bold text-[#2D6A7A]">{total} kcal</span>
        </div>
      ) : null}
    </div>
  );
}

export function dietItemsToPayload(items: DietItemDraft[]) {
  return items.map((item, index) => ({
    foodName: item.foodName,
    matchedName: item.matchedName,
    servingLabel: item.servingLabel,
    caloriesPerServing: item.caloriesPerServing,
    servings: item.servings,
    totalCalories: item.totalCalories,
    sortOrder: index,
  }));
}
