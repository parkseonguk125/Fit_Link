"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { RecordCardData } from "@/components/RecordCard";
import { RecordCard } from "@/components/RecordCard";
import { deleteRecords } from "@/lib/actions";
import { CHIP_BUTTON_CLASS } from "@/lib/ui-classes";

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function SelectionCircle({
  selected,
  onToggle,
}: {
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={selected ? "선택 해제" : "선택"}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className={`mt-1 flex h-5 w-5 shrink-0 appearance-none items-center justify-center rounded-full border-2 text-[10px] leading-none transition ${
        selected
          ? "border-[#4A90A4] bg-[#4A90A4] text-white"
          : "border-gray-300 bg-white text-transparent"
      }`}
    >
      ✓
    </button>
  );
}

export function MyRecordsClient({
  records,
  view,
}: {
  records: RecordCardData[];
  view: "list" | "calendar";
}) {
  const router = useRouter();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [current, setCurrent] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isPending, startTransition] = useTransition();
  const showBulkDelete = view === "list";

  useEffect(() => {
    if (!showBulkDelete) {
      setSelectionMode(false);
      setSelectedIds(new Set());
    }
  }, [showBulkDelete]);

  const days = useMemo(() => {
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: firstDay + totalDays }, (_, index) => {
      if (index < firstDay) return null;
      return new Date(year, month, index - firstDay + 1);
    });
  }, [current]);

  const recordDates = useMemo(
    () => records.map((record) => new Date(record.recordDate)),
    [records],
  );

  const displayedRecords = useMemo(() => {
    if (view !== "calendar" || !selectedDate) {
      return records;
    }

    return records.filter((record) =>
      sameDay(new Date(record.recordDate), selectedDate),
    );
  }, [records, view, selectedDate]);

  const displayedIds = displayedRecords.map((record) => record.id);
  const allDisplayedSelected =
    displayedIds.length > 0 &&
    displayedIds.every((id) => selectedIds.has(id));

  function exitSelectionMode() {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }

  function toggleRecord(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (allDisplayedSelected) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(displayedIds));
  }

  function handleDeleteSelected() {
    const ids = displayedIds.filter((id) => selectedIds.has(id));
    if (ids.length === 0) {
      alert("삭제할 기록을 선택해 주세요.");
      return;
    }

    if (!confirm(`선택한 ${ids.length}개의 기록을 삭제할까요?`)) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteRecords(ids);
        exitSelectionMode();
        router.refresh();
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "삭제 중 오류가 발생했습니다.",
        );
      }
    });
  }

  return (
    <div className="space-y-3">
      {showBulkDelete ? (
        <div
          className={`flex flex-wrap items-center gap-2 ${
            selectionMode ? "" : "justify-end"
          }`}
        >
          {selectionMode ? (
            <>
              <button
                type="button"
                onClick={exitSelectionMode}
                disabled={isPending}
                className={`${CHIP_BUTTON_CLASS} bg-gray-100 text-gray-700 disabled:opacity-60`}
              >
                취소
              </button>
              <button
                type="button"
                onClick={toggleSelectAll}
                disabled={isPending || displayedRecords.length === 0}
                className={`${CHIP_BUTTON_CLASS} bg-white text-gray-700 ring-1 ring-gray-200 disabled:opacity-60`}
              >
                {allDisplayedSelected ? "전체 해제" : "전체 선택"}
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={isPending || selectedIds.size === 0}
                className={`${CHIP_BUTTON_CLASS} bg-red-50 text-red-600 disabled:opacity-60`}
              >
                {isPending
                  ? "삭제 중..."
                  : `선택 삭제${selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}`}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSelectionMode(true)}
              className={`${CHIP_BUTTON_CLASS} bg-white text-red-600 ring-1 ring-red-100`}
            >
              선택·전체 삭제
            </button>
          )}
        </div>
      ) : null}

      {showBulkDelete && selectionMode ? (
        <p className="text-xs text-gray-500">
          왼쪽 원을 눌러 기록을 선택한 뒤 삭제할 수 있어요.
        </p>
      ) : null}

      {view === "calendar" ? (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setCurrent(
                  new Date(current.getFullYear(), current.getMonth() - 1, 1),
                )
              }
              className="rounded-lg px-3 py-2 text-sm text-gray-600"
            >
              이전
            </button>
            <p className="text-sm font-semibold text-gray-900">
              {current.getFullYear()}년 {current.getMonth() + 1}월
            </p>
            <button
              type="button"
              onClick={() =>
                setCurrent(
                  new Date(current.getFullYear(), current.getMonth() + 1, 1),
                )
              }
              className="rounded-lg px-3 py-2 text-sm text-gray-600"
            >
              다음
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <span key={day}>{day}</span>
            ))}
            {days.map((day, index) => {
              if (!day) {
                return <span key={`empty-${index}`} />;
              }

              const hasRecord = recordDates.some((date) => sameDay(date, day));
              const selected = selectedDate && sameDay(day, selectedDate);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={`relative min-h-10 rounded-lg text-sm ${
                    selected
                      ? "bg-[#4A90A4] text-white"
                      : "bg-gray-50 text-gray-800"
                  }`}
                >
                  {day.getDate()}
                  {hasRecord ? (
                    <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-orange-400" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {view === "calendar" && records.length === 0 ? (
        <p className="text-center text-sm text-gray-500">
          아직 기록이 없어요. 날짜를 선택해도 표시할 기록이 없습니다.
        </p>
      ) : null}

      {view === "calendar" && records.length > 0 && selectedDate && displayedRecords.length === 0 ? (
        <p className="text-center text-sm text-gray-500">
          선택한 날짜에 기록이 없습니다.
        </p>
      ) : null}

      <div className="space-y-3">
        {displayedRecords.map((record) => {
          const selected = selectedIds.has(record.id);

          if (showBulkDelete && selectionMode) {
            return (
              <div key={record.id} className="flex items-start gap-3">
                <SelectionCircle
                  selected={selected}
                  onToggle={() => toggleRecord(record.id)}
                />
                <button
                  type="button"
                  onClick={() => toggleRecord(record.id)}
                  className={`min-w-0 flex-1 rounded-xl text-left transition ${
                    selected ? "ring-2 ring-[#4A90A4]/40" : ""
                  }`}
                >
                  <RecordCard
                    record={record}
                    showDelete={false}
                    disableNavigation
                  />
                </button>
              </div>
            );
          }

          return (
            <RecordCard key={record.id} record={record} showDelete />
          );
        })}
      </div>

      {view === "calendar" && selectedDate ? (
        <button
          type="button"
          onClick={() => setSelectedDate(null)}
          className="block w-full text-center text-sm text-[#4A90A4]"
        >
          날짜 필터 해제
        </button>
      ) : null}
    </div>
  );
}
