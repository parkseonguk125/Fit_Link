import { auth } from "@/auth";
import {
  getPendingFollowRequestCount,
  hasUnreadFriendRequests,
} from "@/lib/follow";

export const dynamic = "force-dynamic";

const POLL_INTERVAL_MS = 2000;
const HEARTBEAT_INTERVAL_MS = 15000;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();
  let lastPayload: string | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const pushUpdate = async () => {
        try {
          const [count, unread] = await Promise.all([
            getPendingFollowRequestCount(userId),
            hasUnreadFriendRequests(userId),
          ]);
          const payload = JSON.stringify({ count, unread });
          if (payload !== lastPayload) {
            lastPayload = payload;
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          }
        } catch {
          // keep stream alive on transient errors
        }
      };

      void pushUpdate();

      const pollId = setInterval(() => {
        void pushUpdate();
      }, POLL_INTERVAL_MS);

      const heartbeatId = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(pollId);
          clearInterval(heartbeatId);
        }
      }, HEARTBEAT_INTERVAL_MS);

      request.signal.addEventListener("abort", () => {
        clearInterval(pollId);
        clearInterval(heartbeatId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
