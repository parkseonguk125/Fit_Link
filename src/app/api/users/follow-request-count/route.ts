import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getPendingFollowRequestCount,
  hasUnreadFriendRequests,
} from "@/lib/follow";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0, unread: false });
  }

  const userId = session.user.id;
  const [count, unread] = await Promise.all([
    getPendingFollowRequestCount(userId),
    hasUnreadFriendRequests(userId),
  ]);

  return NextResponse.json({ count, unread });
}
