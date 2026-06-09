import { getFriendUserIds } from "@/lib/follow";
import { prisma } from "@/lib/prisma";
import type { Visibility } from "@/generated/prisma/client";

export { getFollowingUserIds } from "@/lib/follow";

export async function canViewRecord(
  record: { userId: string; visibility: Visibility },
  viewerId?: string | null,
): Promise<boolean> {
  if (!viewerId) {
    return record.visibility === "PUBLIC";
  }

  if (record.userId === viewerId) {
    return true;
  }

  if (record.visibility === "PUBLIC") {
    return true;
  }

  if (record.visibility === "FOLLOWERS") {
    const follow = await prisma.follow.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { followerId: viewerId, followingId: record.userId },
          { followerId: record.userId, followingId: viewerId },
        ],
      },
    });
    return !!follow;
  }

  return false;
}

export async function getFeedRecordIds(viewerId: string): Promise<string[]> {
  const friendIds = await getFriendUserIds(viewerId);

  const records = await prisma.record.findMany({
    where: {
      OR: [
        { visibility: "PUBLIC" },
        {
          visibility: "FOLLOWERS",
          userId: { in: friendIds },
        },
      ],
      NOT: { userId: viewerId },
    },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });

  return records.map((record) => record.id);
}
