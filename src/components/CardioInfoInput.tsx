"use client";

import type { CardioType } from "@/generated/prisma/client";
import { CardioTypeSelect } from "@/components/CardioTypeSelect";

export type CardioInfoDraft = {
  type: CardioType | "";
  durationHours: string;
  durationMin: string;
  distanceKm: string;
  calories: string;
  heartRateBpm: string;
};

export const EMPTY_CARDIO_INFO: CardioInfoDraft = {
  type: "",
  durationHours: "",
  durationMin: "",
  distanceKm: "",
  calories: "",
  heartRateBpm: "",
};

function parseOptionalInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseOptionalFloat(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function cardioInfoToPayload(draft: CardioInfoDraft) {
  return {
    cardioType: draft.type || null,
    cardioDurationHours: parseOptionalInt(draft.durationHours),
    cardioDurationMin: parseOptionalInt(draft.durationMin),
    cardioDistanceKm: parseOptionalFloat(draft.distanceKm),
    cardioCalories: parseOptionalInt(draft.calories),
    cardioHeartRateBpm: parseOptionalInt(draft.heartRateBpm),
  };
}

type CardioInfoInputProps = {
  value: CardioInfoDraft;
  onChange: (value: CardioInfoDraft) => void;
};

const inputClassName =
  "min-h-12 w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#4A90A4]";

export function CardioInfoInput({ value, onChange }: CardioInfoInputProps) {
  function updateField<K extends keyof CardioInfoDraft>(
    field: K,
    fieldValue: CardioInfoDraft[K],
  ) {
    onChange({ ...value, [field]: fieldValue });
  }

  return (
    <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          운동 종류
        </label>
        <CardioTypeSelect
          value={value.type}
          onChange={(type) => updateField("type", type)}
        />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">운동 정보</p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-2 block text-xs text-gray-500">시간</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={value.durationHours}
                  onChange={(event) =>
                    updateField("durationHours", event.target.value)
                  }
                  placeholder="0"
                  className={inputClassName}
                />
                <span className="shrink-0 text-xs text-gray-500">시간</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  inputMode="numeric"
                  value={value.durationMin}
                  onChange={(event) =>
                    updateField("durationMin", event.target.value)
                  }
                  placeholder="0"
                  className={inputClassName}
                />
                <span className="shrink-0 text-xs text-gray-500">분</span>
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs text-gray-500">거리</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={value.distanceKm}
                  onChange={(event) =>
                    updateField("distanceKm", event.target.value)
                  }
                  placeholder="0"
                  className={inputClassName}
                />
                <span className="shrink-0 text-sm text-gray-500">km</span>
              </div>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-2 block text-xs text-gray-500">칼로리</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={value.calories}
                  onChange={(event) =>
                    updateField("calories", event.target.value)
                  }
                  placeholder="0"
                  className={inputClassName}
                />
                <span className="shrink-0 text-sm text-gray-500">kcal</span>
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs text-gray-500">심박수</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={value.heartRateBpm}
                  onChange={(event) =>
                    updateField("heartRateBpm", event.target.value)
                  }
                  placeholder="0"
                  className={inputClassName}
                />
                <span className="shrink-0 text-sm text-gray-500">bpm</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
