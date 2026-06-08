import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { RecordCard } from "@/components/RecordCard";
import { CalendarView } from "@/components/CalendarView";
import { EmptyState } from "@/components/EmptyState";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  CATEGORY_OPTIONS,
  EXERCISE_PART_OPTIONS,
  categoryLabel,
  exercisePartLabel,
} from "@/lib/constants";
import type { Category, ExercisePart } from "@/generated/prisma/client";

export default async function MyRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: Category;
    part?: ExercisePart;
    view?: string;
  }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const view = params.view ?? "list";

  const records = await prisma.record.findMany({
    where: {
      userId: session!.user!.id,
      ...(params.category ? { category: params.category } : {}),
      ...(params.part ? { exercisePart: params.part } : {}),
    },
    include: {
      user: {
        select: { id: true, displayName: true, role: true },
      },
      media: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, mediaType: true, url: true },
      },
      _count: { select: { comments: true } },
    },
    orderBy: [{ recordDate: "desc" }, { createdAt: "desc" }],
  });

  function buildHref(next: Record<string, string | undefined>) {
    const query = new URLSearchParams();
    const merged = {
      category: params.category,
      part: params.part,
      view,
      ...next,
    };

    Object.entries(merged).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });

    const queryString = query.toString();
    return queryString ? `/me/records?${queryString}` : "/me/records";
  }

  return (
    <MobileShell title="내 기록">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Link
            href={buildHref({ view: "list", category: undefined, part: undefined })}
            className={`min-h-10 flex-1 rounded-xl text-sm leading-10 ${
              view === "list"
                ? "bg-[#4A90A4] text-white"
                : "bg-white text-gray-700 ring-1 ring-gray-200"
            } text-center`}
          >
            목록
          </Link>
          <Link
            href={buildHref({ view: "calendar" })}
            className={`min-h-10 flex-1 rounded-xl text-sm leading-10 ${
              view === "calendar"
                ? "bg-[#4A90A4] text-white"
                : "bg-white text-gray-700 ring-1 ring-gray-200"
            } text-center`}
          >
            캘린더
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={buildHref({ category: undefined, part: undefined })}
            className={`rounded-full px-3 py-2 text-xs ${
              !params.category
                ? "bg-[#4A90A4] text-white"
                : "bg-white text-gray-700 ring-1 ring-gray-200"
            }`}
          >
            전체
          </Link>
          {CATEGORY_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={buildHref({
                category: option.value,
                part: option.value === "EXERCISE" ? params.part : undefined,
              })}
              className={`rounded-full px-3 py-2 text-xs ${
                params.category === option.value
                  ? "bg-[#4A90A4] text-white"
                  : "bg-white text-gray-700 ring-1 ring-gray-200"
              }`}
            >
              {categoryLabel(option.value)}
            </Link>
          ))}
        </div>

        {params.category === "EXERCISE" ? (
          <div className="flex flex-wrap gap-2">
            {EXERCISE_PART_OPTIONS.map((option) => (
              <Link
                key={option.value}
                href={buildHref({ part: option.value })}
                className={`rounded-full px-3 py-2 text-xs ${
                  params.part === option.value
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-700 ring-1 ring-gray-200"
                }`}
              >
                {exercisePartLabel(option.value)}
              </Link>
            ))}
          </div>
        ) : null}

        {records.length === 0 ? (
          <EmptyState
            title="아직 기록이 없어요"
            description="기록 탭에서 첫 운동·식단 기록을 남겨 보세요."
          />
        ) : view === "calendar" ? (
          <CalendarView records={records} />
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
