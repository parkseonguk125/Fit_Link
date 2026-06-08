import { prisma } from "@/lib/prisma";
import type { Visibility } from "@/generated/prisma/client";

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
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: viewerId,
          followingId: record.userId,
        },
      },
    });
    return !!follow;
  }

  return false;
}

export async function getFeedRecordIds(viewerId: string): Promise<string[]> {
  const following = await prisma.follow.findMany({
    where: { followerId: viewerId },
    select: { followingId: true },
  });

  const followingIds = following.map((item) => item.followingId);

  const records = await prisma.record.findMany({
    where: {
      OR: [
        { visibility: "PUBLIC" },
        {
          visibility: "FOLLOWERS",
          userId: { in: followingIds },
        },
      ],
      NOT: { userId: viewerId },
    },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });

  return records.map((record) => record.id);
}
