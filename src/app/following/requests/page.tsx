import { FollowRequestList } from "@/components/FollowRequestList";
import { FriendRequestsSeenNotifier } from "@/components/FriendRequestsSeenNotifier";
import { MobileShell } from "@/components/MobileShell";
import { auth } from "@/auth";
import {
  getPendingFollowRequests,
  markFriendRequestsSeen,
} from "@/lib/follow";

export default async function FriendRequestsPage() {
  const session = await auth();
  const userId = session!.user!.id;

  await markFriendRequestsSeen(userId);
  const followRequests = await getPendingFollowRequests(userId);

  return (
    <MobileShell title="친구 요청">
      <FriendRequestsSeenNotifier />
      <section>
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          받은 친구 요청 ({followRequests.length})
        </h2>
        <FollowRequestList requests={followRequests} />
      </section>
    </MobileShell>
  );
}
