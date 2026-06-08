"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { RecordCardData } from "@/components/RecordCard";
import { RecordCard } from "@/components/RecordCard";

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function CalendarView({ records }: { records: RecordCardData[] }) {
  const [current, setCurrent] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const filteredRecords = selectedDate
    ? records.filter((record) =>
        sameDay(new Date(record.recordDate), selectedDate),
      )
    : records;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1))
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
              setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1))
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
                  selected ? "bg-[#4A90A4] text-white" : "bg-gray-50 text-gray-800"
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

      <div className="space-y-3">
        {filteredRecords.map((record) => (
          <RecordCard key={record.id} record={record} />
        ))}
      </div>

      {selectedDate ? (
        <Link
          href="/me/records"
          onClick={() => setSelectedDate(null)}
          className="block text-center text-sm text-[#4A90A4]"
        >
          날짜 필터 해제
        </Link>
      ) : null}
    </div>
  );
}
