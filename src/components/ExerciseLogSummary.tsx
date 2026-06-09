export type ExerciseSetDisplay = {
  id: string;
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
};

export type ExerciseEntryDisplay = {
  id: string;
  exerciseKey: string;
  exerciseName: string;
  sets: ExerciseSetDisplay[];
};

function formatWeight(weight: number): string {
  return Number.isInteger(weight) ? String(weight) : weight.toFixed(1);
}

export function ExerciseLogSummary({
  entries,
  compact = false,
}: {
  entries: ExerciseEntryDisplay[];
  compact?: boolean;
}) {
  if (entries.length === 0) return null;

  if (compact) {
    const first = entries[0];
    const suffix =
      entries.length > 1 ? ` 외 ${entries.length - 1}종목` : "";
    return (
      <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
        {first.exerciseName} {first.sets.length}세트{suffix}
      </span>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="rounded-xl bg-sky-50/80 p-4 ring-1 ring-sky-100"
        >
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            {entry.exerciseName}
          </h2>
          <ul className="space-y-2">
            {entry.sets.map((set) => (
              <li
                key={set.id}
                className="flex items-center justify-between text-sm text-gray-800"
              >
                <span className="font-medium text-gray-700">
                  {set.setNumber}세트
                </span>
                <span>
                  {set.weightKg != null ? `${formatWeight(set.weightKg)}kg` : "-"}
                  {" × "}
                  {set.reps != null ? `${set.reps}회` : "-"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
