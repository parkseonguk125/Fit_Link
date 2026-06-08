import Link from "next/link";
import { notFound } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { CategoryBadge } from "@/components/CategoryBadge";
import { UserBadge } from "@/components/UserBadge";
import { CommentList } from "@/components/CommentList";
import { CommentForm } from "@/components/CommentForm";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canViewRecord } from "@/lib/access";
import {
  exercisePartLabel,
  visibilityLabel,
} from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";

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

  const noteSections = [
    { title: "오늘 느낀 점", content: record.feltNote },
    { title: "힘들었던 점", content: record.hardNote },
    { title: "부족한 점", content: record.lackingNote },
    { title: "알고 싶은 점", content: record.questionNote },
  ].filter((section) => section.content.trim());

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
            <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs text-gray-500">
              {visibilityLabel(record.visibility)}
            </span>
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

        {record.media.map((media) =>
          media.mediaType === "IMAGE" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={media.id}
              src={media.url}
              alt="기록 이미지"
              className="w-full rounded-xl object-cover"
            />
          ) : (
            <div key={media.id} className="aspect-video overflow-hidden rounded-xl">
              <iframe
                src={media.url}
                title="유튜브 영상"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ),
        )}

        {noteSections.map((section) => (
          <div key={section.title} className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-gray-900">
              {section.title}
            </h2>
            <p className="whitespace-pre-wrap text-sm text-gray-700">
              {section.content}
            </p>
          </div>
        ))}

        <div className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">피드백</h2>
          <CommentList comments={record.comments} />
          <CommentForm recordId={record.id} />
        </div>
      </div>
    </MobileShell>
  );
}
