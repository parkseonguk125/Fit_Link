import Link from "next/link";
import type { CardioType, Category, ExercisePart, Role, Visibility } from "@/generated/prisma/client";
import { CategoryBadge } from "@/components/CategoryBadge";
import { CardioInfoSummary } from "@/components/CardioInfoSummary";
import { DietCalorieSummary } from "@/components/DietCalorieSummary";
import { DeleteRecordButton } from "@/components/DeleteRecordButton";
import { ExerciseLogSummary } from "@/components/ExerciseLogSummary";
import type { ExerciseEntryDisplay } from "@/components/ExerciseLogSummary";
import { FollowButton } from "@/components/FollowButton";
import { UserBadge } from "@/components/UserBadge";
import type { FollowState } from "@/lib/follow";
import { exercisePartLabel } from "@/lib/constants";
import { formatDate, formatDateTime, getRecordMemo } from "@/lib/format";

export type RecordCardData = {
  id: string;
  category: Category;
  exercisePart: ExercisePart | null;
  cardioType: CardioType | null;
  cardioDurationHours: number | null;
  cardioDurationMin: number | null;
  cardioDistanceKm: number | null;
  cardioCalories: number | null;
  cardioHeartRateBpm: number | null;
  recordDate: Date;
  createdAt: Date;
  feltNote: string;
  hardNote: string;
  lackingNote: string;
  questionNote: string;
  visibility: Visibility;
  user: {
    id: string;
    displayName: string;
    role: Role;
  };
  media: { id: string; mediaType: "IMAGE" | "YOUTUBE" | "LINK"; url: string }[];
  dietItems?: {
    id: string;
    foodName: string;
    matchedName: string;
    servingLabel: string;
    caloriesPerServing: number;
    servings: number;
    totalCalories: number;
  }[];
  exerciseEntries?: ExerciseEntryDisplay[];
  _count?: { comments: number };
};

export function RecordCard({
  record,
  viewerId,
  followState = "none",
  showDelete = false,
  disableNavigation = false,
}: {
  record: RecordCardData;
  viewerId?: string;
  followState?: FollowState;
  showDelete?: boolean;
  disableNavigation?: boolean;
}) {
  const firstMedia = record.media[0];
  const memo = getRecordMemo(record);
  const preview =
    memo ||
    (firstMedia
      ? firstMedia.mediaType === "IMAGE"
        ? "사진이 포함된 기록"
        : firstMedia.mediaType === "YOUTUBE"
          ? "영상이 포함된 기록"
          : "링크가 포함된 기록"
      : "메모 없음");

  const images = record.media.filter((item) => item.mediaType === "IMAGE");
  const showFollow = viewerId && viewerId !== record.user.id;

  const body = (
    <>
      {images.length > 0 ? (
        <div
          className={`mb-3 grid gap-1 ${
            images.length === 1
              ? "grid-cols-1"
              : images.length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
          }`}
        >
          {images.slice(0, 3).map((image, index) => (
            <div key={image.id} className="relative overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={`기록 사진 ${index + 1}`}
                className={`w-full object-cover ${
                  images.length === 1 ? "h-40" : "h-24"
                }`}
              />
              {index === 2 && images.length > 3 ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
                  +{images.length - 3}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <p className="line-clamp-2 text-sm text-gray-700">{preview}</p>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{formatDate(record.recordDate)}</span>
        <span>
          {formatDateTime(record.createdAt)}
          {record._count ? ` · 댓글 ${record._count.comments}` : ""}
        </span>
      </div>
    </>
  );

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={record.category} />
          {record.exercisePart ? (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
              {exercisePartLabel(record.exercisePart)}
            </span>
          ) : null}
          {record.dietItems && record.dietItems.length > 0 ? (
            <DietCalorieSummary items={record.dietItems} compact />
          ) : null}
          {record.category === "CARDIO" ? (
            <CardioInfoSummary
              info={{
                cardioType: record.cardioType,
                cardioDurationHours: record.cardioDurationHours,
                cardioDurationMin: record.cardioDurationMin,
                cardioDistanceKm: record.cardioDistanceKm,
                cardioCalories: record.cardioCalories,
                cardioHeartRateBpm: record.cardioHeartRateBpm,
              }}
              compact
            />
          ) : null}
          {record.exerciseEntries && record.exerciseEntries.length > 0 ? (
            <ExerciseLogSummary entries={record.exerciseEntries} compact />
          ) : null}
        </div>
        {showDelete ? <DeleteRecordButton recordId={record.id} /> : null}
      </div>

      {disableNavigation ? (
        <div className="block">{body}</div>
      ) : (
        <Link href={`/records/${record.id}`} className="block">
          {body}
        </Link>
      )}

      {!disableNavigation ? (
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
        <Link
          href={`/users/${record.user.id}`}
          className="flex min-w-0 items-center gap-2"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm">
            👤
          </span>
          <span className="truncate text-sm font-medium text-gray-900">
            {record.user.displayName}
          </span>
          <UserBadge role={record.user.role} />
        </Link>
        {showFollow ? (
          <FollowButton
            userId={record.user.id}
            initialState={followState}
            compact
          />
        ) : null}
      </div>
      ) : null}
    </div>
  );
}
