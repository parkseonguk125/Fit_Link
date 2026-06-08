import { MobileShell } from "@/components/MobileShell";
import { RecordCard } from "@/components/RecordCard";
import { EmptyState } from "@/components/EmptyState";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getFeedRecordIds } from "@/lib/access";

export default async function FeedPage() {
  const session = await auth();
  const viewerId = session!.user!.id;

  const feedIds = await getFeedRecordIds(viewerId);

  const records = await prisma.record.findMany({
    where: { id: { in: feedIds } },
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
    orderBy: { createdAt: "desc" },
  });

  return (
    <MobileShell title="홈 피드">
      <div className="space-y-4">
        {records.length === 0 ? (
          <EmptyState
            title="아직 피드에 표시할 기록이 없어요"
            description="전체 공개 기록을 작성하거나 다른 사용자를 팔로우해 보세요."
          />
        ) : (
          records.map((record) => <RecordCard key={record.id} record={record} />)
        )}
      </div>
    </MobileShell>
  );
}
