import { notFound } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { RecordCard } from "@/components/RecordCard";
import { FollowButton } from "@/components/FollowButton";
import { TrainerProfileSummary } from "@/components/TrainerProfileSummary";
import { UserBadge } from "@/components/UserBadge";
import { EmptyState } from "@/components/EmptyState";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getFollowStateBetween, getFriendUserIds } from "@/lib/follow";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      displayName: true,
      bio: true,
      role: true,
      trainerRegion: true,
      trainerGymName: true,
      trainerPosition: true,
      trainerCareer: true,
      _count: {
        select: {
          followers: { where: { status: "ACCEPTED" } },
          following: { where: { status: "ACCEPTED" } },
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const friendCount = (await getFriendUserIds(id)).length;

  const followState = session?.user?.id
    ? await getFollowStateBetween(session.user.id, id)
    : "none";
  const viewerId = session?.user?.id;
  const isOwner = viewerId === id;

  const visibilityFilter = isOwner
    ? undefined
    : followState === "accepted"
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
      dietItems: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          foodName: true,
          matchedName: true,
          servingLabel: true,
          caloriesPerServing: true,
          servings: true,
          totalCalories: true,
        },
      },
      exerciseEntries: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          exerciseKey: true,
          exerciseName: true,
          sets: {
            orderBy: { setNumber: "asc" },
            select: {
              id: true,
              setNumber: true,
              weightKg: true,
              reps: true,
            },
          },
        },
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
              {user.role === "TRAINER" ? (
                <TrainerProfileSummary
                  profile={{
                    trainerRegion: user.trainerRegion,
                    trainerGymName: user.trainerGymName,
                    trainerPosition: user.trainerPosition,
                    trainerCareer: user.trainerCareer,
                  }}
                />
              ) : null}
              <p className="mt-3 text-xs text-gray-500">
                팔로워 {user._count.followers} · 친구 {friendCount}
              </p>
            </div>
            {session?.user?.id !== id ? (
              <FollowButton userId={id} initialState={followState} />
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
