"use client";

import { useEffect, useState } from "react";
import type { ExercisePart } from "@/generated/prisma/client";
import { ScrollableSelect } from "@/components/ScrollableSelect";
import { getPreviousExerciseSets } from "@/lib/actions";
import { createClientId } from "@/lib/create-id";
import {
  formatPreviousSet,
  getExerciseLabel,
  getExercisesByPart,
  isSetImproved,
  type PreviousExerciseSet,
} from "@/lib/exercises";

export type ExerciseSetDraft = {
  id: string;
  weightKg: string;
  reps: string;
};

export type ExerciseBlockDraft = {
  id: string;
  exerciseKey: string;
  sets: ExerciseSetDraft[];
};

export function createEmptyExerciseBlock(): ExerciseBlockDraft {
  return {
    id: createClientId(),
    exerciseKey: "",
    sets: [createEmptySet()],
  };
}

function createEmptySet(): ExerciseSetDraft {
  return {
    id: createClientId(),
    weightKg: "",
    reps: "",
  };
}

function parseSetValues(set: ExerciseSetDraft) {
  const weightKg = Number.parseFloat(set.weightKg);
  const reps = Number.parseInt(set.reps, 10);
  return {
    weightKg: Number.isFinite(weightKg) ? weightKg : null,
    reps: Number.isFinite(reps) ? reps : null,
  };
}

export function exerciseLogToPayload(blocks: ExerciseBlockDraft[]) {
  return blocks
    .filter((block) => block.exerciseKey)
    .map((block, blockIndex) => ({
      exerciseKey: block.exerciseKey,
      exerciseName: getExerciseLabel(block.exerciseKey),
      sortOrder: blockIndex,
      sets: block.sets
        .map((set, setIndex) => {
          const parsed = parseSetValues(set);
          return {
            setNumber: setIndex + 1,
            weightKg: parsed.weightKg,
            reps: parsed.reps,
            sortOrder: setIndex,
          };
        })
        .filter((set) => set.weightKg != null || set.reps != null),
    }))
    .filter((block) => block.sets.length > 0);
}

const inputClassName =
  "min-h-10 w-16 rounded-lg border border-gray-200 bg-white px-2 text-center text-sm outline-none focus:border-[#4A90A4]";

type ExerciseLogInputProps = {
  exercisePart: ExercisePart;
  value: ExerciseBlockDraft[];
  onChange: (value: ExerciseBlockDraft[]) => void;
};

function ExerciseBlockEditor({
  block,
  exercisePart,
  onChange,
  onRemove,
  canRemove,
}: {
  block: ExerciseBlockDraft;
  exercisePart: ExercisePart;
  onChange: (block: ExerciseBlockDraft) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [previousSets, setPreviousSets] = useState<PreviousExerciseSet[]>([]);
  const exerciseOptions = getExercisesByPart(exercisePart).map((item) => ({
    value: item.key,
    label: item.label,
  }));

  useEffect(() => {
    if (!block.exerciseKey) {
      setPreviousSets([]);
      return;
    }

    let cancelled = false;

    void getPreviousExerciseSets(block.exerciseKey).then((sets) => {
      if (!cancelled) {
        setPreviousSets(sets);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [block.exerciseKey]);

  function updateSet(setId: string, patch: Partial<ExerciseSetDraft>) {
    onChange({
      ...block,
      sets: block.sets.map((set) =>
        set.id === setId ? { ...set, ...patch } : set,
      ),
    });
  }

  function addSet() {
    onChange({
      ...block,
      sets: [...block.sets, createEmptySet()],
    });
  }

  function removeSet(setId: string) {
    if (block.sets.length <= 1) return;
    onChange({
      ...block,
      sets: block.sets.filter((set) => set.id !== setId),
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <ScrollableSelect
            label="운동 선택"
            placeholder="운동을 선택하세요"
            value={block.exerciseKey}
            options={exerciseOptions}
            onChange={(exerciseKey) =>
              onChange({ ...block, exerciseKey, sets: [createEmptySet()] })
            }
          />
        </div>
        {canRemove ? (
          <button
            type="button"
            aria-label="운동 종목 삭제"
            onClick={onRemove}
            className="mt-8 shrink-0 rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
          >
            삭제
          </button>
        ) : null}
      </div>

      {block.exerciseKey ? (
        <div className="space-y-2">
          {block.sets.map((set, index) => {
            const previous = previousSets.find(
              (item) => item.setNumber === index + 1,
            );
            const parsed = parseSetValues(set);
            const improved =
              parsed.weightKg != null &&
              parsed.reps != null &&
              isSetImproved(parsed.weightKg, parsed.reps, previous);

            return (
              <div
                key={set.id}
                className="rounded-lg bg-white px-3 py-2 ring-1 ring-gray-100"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span className="w-10 shrink-0 font-medium text-gray-700">
                    {index + 1}세트
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      inputMode="decimal"
                      value={set.weightKg}
                      onChange={(event) =>
                        updateSet(set.id, { weightKg: event.target.value })
                      }
                      placeholder="0"
                      className={inputClassName}
                    />
                    <span className="text-xs text-gray-500">kg</span>
                  </div>
                  <span className="text-gray-400">×</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={set.reps}
                      onChange={(event) =>
                        updateSet(set.id, { reps: event.target.value })
                      }
                      placeholder="0"
                      className={inputClassName}
                    />
                    <span className="text-xs text-gray-500">회</span>
                  </div>
                  {previous ? (
                    <span className="text-xs text-gray-500">
                      [{formatPreviousSet(previous)}]
                    </span>
                  ) : null}
                  {parsed.weightKg != null && parsed.reps != null ? (
                    <span
                      className="text-sm"
                      aria-label={improved ? "이전 기록 갱신" : "이전 기록 미달"}
                    >
                      {improved ? "✅" : "⬜"}
                    </span>
                  ) : null}
                  {block.sets.length > 1 ? (
                    <button
                      type="button"
                      aria-label={`${index + 1}세트 삭제`}
                      onClick={() => removeSet(set.id)}
                      className="ml-auto text-xs text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addSet}
            className="min-h-10 rounded-xl border border-dashed border-gray-300 bg-white px-3 text-sm text-gray-600"
          >
            + 세트 추가
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function ExerciseLogInput({
  exercisePart,
  value,
  onChange,
}: ExerciseLogInputProps) {
  function updateBlock(blockId: string, block: ExerciseBlockDraft) {
    onChange(value.map((item) => (item.id === blockId ? block : item)));
  }

  function removeBlock(blockId: string) {
    onChange(value.filter((item) => item.id !== blockId));
  }

  function addBlock() {
    onChange([...value, createEmptyExerciseBlock()]);
  }

  return (
    <div className="space-y-3">
      {value.map((block) => (
        <ExerciseBlockEditor
          key={block.id}
          block={block}
          exercisePart={exercisePart}
          onChange={(next) => updateBlock(block.id, next)}
          onRemove={() => removeBlock(block.id)}
          canRemove={value.length > 1}
        />
      ))}

      <button
        type="button"
        onClick={addBlock}
        className="min-h-11 w-full rounded-xl border border-dashed border-[#4A90A4]/40 bg-white px-3 text-sm font-medium text-[#4A90A4]"
      >
        + 다른 운동 종목 추가
      </button>
    </div>
  );
}
