"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CALENDAR_YEAR_MAX,
  CALENDAR_YEAR_MIN,
  clampLunarDay,
  clampSolarDay,
  dateFromParts,
  getLunarDaysInMonth,
  partsFromDate,
  type CalendarParts,
} from "@/lib/lunar-calendar";

const ITEM_HEIGHT = 34;
const PADDING_ROWS = 2;
const WHEEL_HEIGHT = 170;

function WheelColumn({
  values,
  selected,
  onSelect,
  format,
  columnKey,
}: {
  values: number[];
  selected: number;
  onSelect: (value: number) => void;
  format: (value: number) => string;
  columnKey: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const isProgrammaticScrollRef = useRef(false);

  useEffect(() => {
    const index = values.indexOf(selected);
    if (!ref.current || index < 0) {
      return;
    }

    isProgrammaticScrollRef.current = true;
    ref.current.scrollTop = index * ITEM_HEIGHT;
    window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 50);
  }, [selected, values, columnKey]);

  function syncSelectionFromScroll() {
    if (!ref.current || isProgrammaticScrollRef.current) {
      return;
    }

    const index = Math.round(ref.current.scrollTop / ITEM_HEIGHT);
    const value = values[Math.max(0, Math.min(values.length - 1, index))];
    if (value !== undefined && value !== selected) {
      onSelect(value);
    }
  }

  function handleScroll() {
    if (scrollTimerRef.current !== null) {
      window.clearTimeout(scrollTimerRef.current);
    }
    scrollTimerRef.current = window.setTimeout(syncSelectionFromScroll, 80);
  }

  return (
    <div
      className="relative flex-1 overflow-hidden"
      style={{ height: WHEEL_HEIGHT }}
    >
      <div
        ref={ref}
        onScroll={handleScroll}
        className="h-full overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: "y mandatory",
          paddingTop: ITEM_HEIGHT * PADDING_ROWS,
          paddingBottom: ITEM_HEIGHT * PADDING_ROWS,
        }}
      >
        {values.map((value) => {
          const active = value === selected;
          return (
            <button
              key={`${columnKey}-${value}`}
              type="button"
              onClick={() => onSelect(value)}
              className={`flex w-full shrink-0 snap-center items-center justify-center text-sm transition ${
                active
                  ? "font-semibold text-[#4A90A4]"
                  : "font-normal text-gray-400"
              }`}
              style={{ height: ITEM_HEIGHT }}
            >
              {format(value)}
            </button>
          );
        })}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-1 top-1/2 -translate-y-1/2 rounded-lg border border-[#4A90A4]/25 bg-[#4A90A4]/5"
        style={{ height: ITEM_HEIGHT }}
      />
    </div>
  );
}

export function CalendarDatePickerSheet({
  open,
  initialDate,
  onClose,
  onConfirm,
}: {
  open: boolean;
  initialDate: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
}) {
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  const [parts, setParts] = useState<CalendarParts>(() =>
    partsFromDate(initialDate, "solar"),
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    setCalendarType("solar");
    setParts(partsFromDate(initialDate, "solar"));
  }, [open, initialDate]);

  const years = useMemo(
    () =>
      Array.from(
        { length: CALENDAR_YEAR_MAX - CALENDAR_YEAR_MIN + 1 },
        (_, index) => CALENDAR_YEAR_MIN + index,
      ),
    [],
  );
  const months = useMemo(
    () => Array.from({ length: 12 }, (_, index) => index + 1),
    [],
  );
  const days = useMemo(() => {
    const total =
      calendarType === "solar"
        ? new Date(parts.year, parts.month, 0).getDate()
        : getLunarDaysInMonth(parts.year, parts.month);
    return Array.from({ length: total }, (_, index) => index + 1);
  }, [calendarType, parts.year, parts.month]);

  useEffect(() => {
    setParts((current) => {
      const clampedDay =
        calendarType === "solar"
          ? clampSolarDay(current.year, current.month, current.day)
          : clampLunarDay(current.year, current.month, current.day);
      if (clampedDay === current.day) {
        return current;
      }
      return { ...current, day: clampedDay };
    });
  }, [calendarType, parts.year, parts.month]);

  if (!open) {
    return null;
  }

  function updatePart(key: keyof CalendarParts, value: number) {
    setParts((current) => ({ ...current, [key]: value }));
  }

  function switchCalendarType(nextType: "solar" | "lunar") {
    if (nextType === calendarType) {
      return;
    }
    const anchorDate = dateFromParts(parts, calendarType);
    setCalendarType(nextType);
    setParts(partsFromDate(anchorDate, nextType));
  }

  function handleConfirm() {
    onConfirm(dateFromParts(parts, calendarType));
  }

  const headerLabel =
    calendarType === "solar"
      ? `${parts.year}년 ${String(parts.month).padStart(2, "0")}월`
      : `${parts.year}년 음력 ${String(parts.month).padStart(2, "0")}월`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="날짜 선택"
        className="relative w-full max-w-[300px] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200"
      >
        <div className="border-b border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900">{headerLabel}</p>
            <div className="flex shrink-0 rounded-full bg-gray-100 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => switchCalendarType("solar")}
                className={`rounded-full px-2.5 py-1 transition ${
                  calendarType === "solar"
                    ? "bg-[#4A90A4] font-semibold text-white shadow-sm"
                    : "text-gray-600"
                }`}
              >
                양력
              </button>
              <button
                type="button"
                onClick={() => switchCalendarType("lunar")}
                className={`rounded-full px-2.5 py-1 transition ${
                  calendarType === "lunar"
                    ? "bg-[#4A90A4] font-semibold text-white shadow-sm"
                    : "text-gray-600"
                }`}
              >
                음력
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-0.5 px-2 py-3">
          <WheelColumn
            columnKey={`${calendarType}-year`}
            values={years}
            selected={parts.year}
            onSelect={(value) => updatePart("year", value)}
            format={(value) => `${value}년`}
          />
          <WheelColumn
            columnKey={`${calendarType}-month`}
            values={months}
            selected={parts.month}
            onSelect={(value) => updatePart("month", value)}
            format={(value) => `${String(value).padStart(2, "0")}월`}
          />
          <WheelColumn
            columnKey={`${calendarType}-day-${parts.year}-${parts.month}`}
            values={days}
            selected={parts.day}
            onSelect={(value) => updatePart("day", value)}
            format={(value) => `${String(value).padStart(2, "0")}일`}
          />
        </div>

        <div className="flex border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            취소
          </button>
          <div className="w-px bg-gray-100" />
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 text-sm font-semibold text-[#4A90A4] transition hover:bg-[#4A90A4]/5"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
