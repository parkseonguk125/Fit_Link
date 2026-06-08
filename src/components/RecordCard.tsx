import Link from "next/link";
import type { Category, ExercisePart, Role, Visibility } from "@/generated/prisma/client";
import { CategoryBadge } from "@/components/CategoryBadge";
import { UserBadge } from "@/components/UserBadge";
import { exercisePartLabel, visibilityLabel } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";

export type RecordCardData = {
  id: string;
  category: Category;
  exercisePart: ExercisePart | null;
  recordDate: Date;
  createdAt: Date;
  feltNote: string;
  visibility: Visibility;
  user: {
    id: string;
    displayName: string;
    role: Role;
  };
  media: { id: string; mediaType: "IMAGE" | "YOUTUBE"; url: string }[];
  _count?: { comments: number };
};

export function RecordCard({ record }: { record: RecordCardData }) {
  const firstMedia = record.media[0];
  const preview =
    record.feltNote ||
    (firstMedia
      ? firstMedia.mediaType === "IMAGE"
        ? "사진이 포함된 기록"
        : "영상이 포함된 기록"
      : "메모 없음");

  const image = record.media.find((item) => item.mediaType === "IMAGE");

  return (
    <Link
      href={`/records/${record.id}`}
      className="block rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={record.category} />
          {record.exercisePart ? (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
              {exercisePartLabel(record.exercisePart)}
            </span>
          ) : null}
          <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs text-gray-500">
            {visibilityLabel(record.visibility)}
          </span>
        </div>
      </div>

      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.url}
          alt="기록 이미지"
          className="mb-3 h-40 w-full rounded-lg object-cover"
        />
      ) : null}

      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900">
          {record.user.displayName}
        </span>
        <UserBadge role={record.user.role} />
      </div>

      <p className="line-clamp-2 text-sm text-gray-700">{preview}</p>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{formatDate(record.recordDate)}</span>
        <span>
          {formatDateTime(record.createdAt)}
          {record._count ? ` · 댓글 ${record._count.comments}` : ""}
        </span>
      </div>
    </Link>
  );
}
