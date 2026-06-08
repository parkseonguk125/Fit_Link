import { notFound } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { RecordCard } from "@/components/RecordCard";
import { FollowButton } from "@/components/FollowButton";
import { UserBadge } from "@/components/UserBadge";
import { EmptyState } from "@/components/EmptyState";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { followers: true, following: true } },
    },
  });

  if (!user) {
    notFound();
  }

  const following = session?.user?.id
    ? await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: id,
          },
        },
      })
    : null;

  const viewerId = session?.user?.id;
  const isOwner = viewerId === id;

  const visibilityFilter = isOwner
    ? undefined
    : following
      ? (["PUBLIC", "FOLLOWERS"] as const)
      : (["PUBLIC"] as const);

  const records = await prisma.record.findMany({
    where: {
      userId: id,
      ...(visibilityFilter ? { visibility: { in: [...visibilityFilter] } } : {}),
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
    orderBy: { createdAt: "desc" },
  });

  return (
    <MobileShell title="사용자 프로필">
      <div className="space-y-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {user.displayName}
                </h2>
                <UserBadge role={user.role} />
              </div>
              {user.bio ? (
                <p className="mt-2 text-sm text-gray-600">{user.bio}</p>
              ) : null}
              <p className="mt-3 text-xs text-gray-500">
                팔로워 {user._count.followers} · 팔로우 {user._count.following}
              </p>
            </div>
            {session?.user?.id !== id ? (
              <FollowButton userId={id} initialFollowing={!!following} />
            ) : null}
          </div>
        </div>

        {records.length === 0 ? (
          <EmptyState title="공개된 기록이 없습니다." />
        ) : (
          records.map((record) => <RecordCard key={record.id} record={record} />)
        )}
      </div>
    </MobileShell>
  );
}
