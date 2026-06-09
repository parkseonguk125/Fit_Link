import { FollowRequestList } from "@/components/FollowRequestList";
import { MobileShell } from "@/components/MobileShell";
import { FollowingUserList } from "@/components/FollowingUserList";
import { UserSearch } from "@/components/UserSearch";
import { auth } from "@/auth";
import { getFriendUserIds } from "@/lib/follow";
import { prisma } from "@/lib/prisma";

export default async function FollowingPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const friendIds = await getFriendUserIds(userId);

  const friends = friendIds.length
    ? await prisma.user.findMany({
        where: { id: { in: friendIds } },
        select: {
          id: true,
          displayName: true,
          bio: true,
          role: true,
        },
        orderBy: { displayName: "asc" },
      })
    : [];

  return (
    <MobileShell title="친구">
      <div className="space-y-6">
        <UserSearch />

        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            나의 친구 목록
          </h2>
          <FollowingUserList users={friends} />
        </section>
      </div>
    </MobileShell>
  );
}
