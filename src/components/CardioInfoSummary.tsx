import type { CardioType } from "@/generated/prisma/client";
import { cardioTypeLabel } from "@/lib/constants";
import { formatCardioDuration } from "@/lib/format";

export type CardioInfoDisplay = {
  cardioType: CardioType | null;
  cardioDurationHours: number | null;
  cardioDurationMin: number | null;
  cardioDistanceKm: number | null;
  cardioCalories: number | null;
  cardioHeartRateBpm: number | null;
};

function hasCardioInfo(info: CardioInfoDisplay): boolean {
  return (
    !!info.cardioType ||
    info.cardioDurationHours != null ||
    info.cardioDurationMin != null ||
    info.cardioDistanceKm != null ||
    info.cardioCalories != null ||
    info.cardioHeartRateBpm != null
  );
}

function formatDistance(km: number): string {
  return Number.isInteger(km) ? String(km) : km.toFixed(2).replace(/\.?0+$/, "");
}

export function CardioInfoSummary({
  info,
  compact = false,
}: {
  info: CardioInfoDisplay;
  compact?: boolean;
}) {
  if (!hasCardioInfo(info)) return null;

  const typeLabel = cardioTypeLabel(info.cardioType);
  const durationLabel = formatCardioDuration(
    info.cardioDurationHours,
    info.cardioDurationMin,
  );

  if (compact) {
    const parts: string[] = [];
    if (typeLabel) parts.push(typeLabel);
    if (durationLabel) parts.push(durationLabel);
    if (info.cardioDistanceKm != null) {
      parts.push(`${formatDistance(info.cardioDistanceKm)}km`);
    }
    if (info.cardioCalories != null) parts.push(`${info.cardioCalories}kcal`);

    return (
      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
        {parts.join(" · ")}
      </span>
    );
  }

  return (
    <div className="rounded-xl bg-orange-50/80 p-4 ring-1 ring-orange-100">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">유산소 · 운동 정보</h2>
      {typeLabel ? (
        <p className="mb-3 text-sm font-medium text-gray-900">{typeLabel}</p>
      ) : null}
      <dl className="grid grid-cols-2 gap-3 text-sm">
        {durationLabel ? (
          <div>
            <dt className="text-xs text-gray-500">시간</dt>
            <dd className="font-medium text-gray-900">{durationLabel}</dd>
          </div>
        ) : null}
        {info.cardioDistanceKm != null ? (
          <div>
            <dt className="text-xs text-gray-500">거리</dt>
            <dd className="font-medium text-gray-900">
              {formatDistance(info.cardioDistanceKm)} km
            </dd>
          </div>
        ) : null}
        {info.cardioCalories != null ? (
          <div>
            <dt className="text-xs text-gray-500">칼로리</dt>
            <dd className="font-medium text-gray-900">{info.cardioCalories} kcal</dd>
          </div>
        ) : null}
        {info.cardioHeartRateBpm != null ? (
          <div>
            <dt className="text-xs text-gray-500">심박수</dt>
            <dd className="font-medium text-gray-900">{info.cardioHeartRateBpm} bpm</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
