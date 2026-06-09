import Link from "next/link";
import { notFound } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { CategoryBadge } from "@/components/CategoryBadge";
import { UserBadge } from "@/components/UserBadge";
import { CommentList } from "@/components/CommentList";
import { CommentForm } from "@/components/CommentForm";
import { DietCalorieSummary } from "@/components/DietCalorieSummary";
import { CardioInfoSummary } from "@/components/CardioInfoSummary";
import { ExerciseLogSummary } from "@/components/ExerciseLogSummary";
import { RecordLinkMedia } from "@/components/RecordLinkMedia";
import { RecordImageGallery } from "@/components/RecordImageGallery";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canViewRecord } from "@/lib/access";
import { exercisePartLabel } from "@/lib/constants";
import { formatDate, formatDateTime, getRecordMemo } from "@/lib/format";

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const record = await prisma.record.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, displayName: true, role: true },
      },
      media: { orderBy: { sortOrder: "asc" } },
      dietItems: { orderBy: { sortOrder: "asc" } },
      exerciseEntries: {
        orderBy: { sortOrder: "asc" },
        include: {
          sets: { orderBy: { setNumber: "asc" } },
        },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: { id: true, displayName: true, role: true },
          },
        },
      },
    },
  });

  if (!record) {
    notFound();
  }

  const allowed = await canViewRecord(record, session?.user?.id);
  if (!allowed) {
    notFound();
  }

  const memo = getRecordMemo(record);
  const images = record.media.filter((media) => media.mediaType === "IMAGE");
  const otherMedia = record.media.filter((media) => media.mediaType !== "IMAGE");

  return (
    <MobileShell title="기록 상세">
      <div className="space-y-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <CategoryBadge category={record.category} />
            {record.exercisePart ? (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                {exercisePartLabel(record.exercisePart)}
              </span>
            ) : null}
          </div>

          <div className="mb-3 flex items-center gap-2">
            <Link
              href={`/users/${record.user.id}`}
              className="text-sm font-medium text-gray-900"
            >
              {record.user.displayName}
            </Link>
            <UserBadge role={record.user.role} />
          </div>

          <p className="text-sm text-gray-600">
            기록일 {formatDate(record.recordDate)} · 작성{" "}
            {formatDateTime(record.createdAt)}
          </p>
        </div>

        {record.dietItems.length > 0 ? (
          <DietCalorieSummary items={record.dietItems} />
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
          />
        ) : null}

        {record.exerciseEntries.length > 0 ? (
          <ExerciseLogSummary entries={record.exerciseEntries} />
        ) : null}

        {images.length > 0 ? (
          <RecordImageGallery
            images={images.map((image) => ({ id: image.id, url: image.url }))}
          />
        ) : null}

        {otherMedia.map((media) => {
          if (media.mediaType === "YOUTUBE") {
            return (
              <div
                key={media.id}
                className="aspect-video overflow-hidden rounded-xl"
              >
                <iframe
                  src={media.url}
                  title="유튜브 영상"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );
          }

          return <RecordLinkMedia key={media.id} url={media.url} />;
        })}

        {memo ? (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-gray-900">메모</h2>
            <p className="whitespace-pre-wrap text-sm text-gray-700">{memo}</p>
          </div>
        ) : null}

        <div className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">피드백</h2>
          <CommentList comments={record.comments} />
          <CommentForm recordId={record.id} />
        </div>
      </div>
    </MobileShell>
  );
}
