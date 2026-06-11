import { prisma } from "@/lib/prisma";
import type { FollowStatus } from "@/generated/prisma/client";

export const ACCEPTED_FOLLOW = { status: "ACCEPTED" as FollowStatus };

export type FollowState = "none" | "pending" | "accepted";

export function toFollowState(
  status: FollowStatus | null | undefined,
): FollowState {
  if (status === "ACCEPTED") {
    return "accepted";
  }
  if (status === "PENDING") {
    return "pending";
  }
  return "none";
}

export async function getFollowingUserIds(viewerId: string): Promise<string[]> {
  const following = await prisma.follow.findMany({
    where: { followerId: viewerId, ...ACCEPTED_FOLLOW },
    select: { followingId: true },
  });

  return following.map((item) => item.followingId);
}

/** 수락된 친구 관계(내가 보낸·받은 요청 모두) */
export async function getFriendUserIds(viewerId: string): Promise<string[]> {
  const [outgoing, incoming] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: viewerId, ...ACCEPTED_FOLLOW },
      select: { followingId: true },
    }),
    prisma.follow.findMany({
      where: { followingId: viewerId, ...ACCEPTED_FOLLOW },
      select: { followerId: true },
    }),
  ]);

  return [
    ...new Set([
      ...outgoing.map((item) => item.followingId),
      ...incoming.map((item) => item.followerId),
    ]),
  ];
}

export async function getFollowStateBetween(
  viewerId: string,
  targetUserId: string,
): Promise<FollowState> {
  const relations = await prisma.follow.findMany({
    where: {
      OR: [
        { followerId: viewerId, followingId: targetUserId },
        { followerId: targetUserId, followingId: viewerId },
      ],
    },
  });

  if (relations.some((relation) => relation.status === "ACCEPTED")) {
    return "accepted";
  }

  const outgoing = relations.find((relation) => relation.followerId === viewerId);
  if (outgoing?.status === "PENDING") {
    return "pending";
  }

  return "none";
}

export async function getPendingFollowRequestCount(
  userId: string,
): Promise<number> {
  return prisma.follow.count({
    where: { followingId: userId, status: "PENDING" },
  });
}

export async function getPendingFollowRequests(userId: string) {
  const requests = await prisma.follow.findMany({
    where: { followingId: userId, status: "PENDING" },
    include: {
      follower: {
        select: {
          id: true,
          displayName: true,
          bio: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return requests.map((request) => request.follower);
}

export async function hasUnreadFriendRequests(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { friendRequestsSeenAt: true },
    });

    if (!user) {
      return false;
    }

    const unreadCount = await prisma.follow.count({
      where: {
        followingId: userId,
        status: "PENDING",
        ...(user.friendRequestsSeenAt
          ? { createdAt: { gt: user.friendRequestsSeenAt } }
          : {}),
      },
    });

    return unreadCount > 0;
  } catch {
    return false;
  }
}

export async function markFriendRequestsSeen(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { friendRequestsSeenAt: new Date() },
    });
  } catch {
    // ignore when column/schema is unavailable
  }
}

export async function getProfileFriendStats(userId: string): Promise<{
  friendCount: number;
  friendRequestCount: number;
  unreadFriendRequests: boolean;
}> {
  try {
    const [friendCount, friendRequestCount, unreadFriendRequests] =
      await Promise.all([
        getFriendUserIds(userId).then((ids) => ids.length),
        getPendingFollowRequestCount(userId),
        hasUnreadFriendRequests(userId),
      ]);

    return { friendCount, friendRequestCount, unreadFriendRequests };
  } catch {
    return {
      friendCount: 0,
      friendRequestCount: 0,
      unreadFriendRequests: false,
    };
  }
}
