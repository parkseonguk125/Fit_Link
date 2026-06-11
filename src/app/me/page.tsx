import Link from "next/link";
import { redirect } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { FriendRequestStatCard } from "@/components/FriendRequestStatCard";
import { ProfileForm } from "@/components/ProfileForm";
import { TrainerProfileSummary } from "@/components/TrainerProfileSummary";
import { UserBadge } from "@/components/UserBadge";
import { auth } from "@/auth";
import {
  getProfileFriendStats,
} from "@/lib/follow";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function ProfileStatCard({
  href,
  value,
  label,
  showBadge = false,
}: {
  href: string;
  value: number;
  label: string;
  showBadge?: boolean;
}) {
  return (
    <Link
      href={href}
      className="relative rounded-lg bg-gray-50 p-3 transition hover:bg-gray-100 active:scale-[0.98]"
    >
      {showBadge ? (
        <span
          aria-label="새 친구 요청"
          className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"
        />
      ) : null}
      <p className="font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </Link>
  );
}

export default async function ProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }

  const [user, { friendCount, friendRequestCount, unreadFriendRequests }] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          displayName: true,
          email: true,
          bio: true,
          role: true,
          trainerRegion: true,
          trainerGymName: true,
          trainerPosition: true,
          trainerCareer: true,
          _count: {
            select: { records: true },
          },
        },
      }),
      getProfileFriendStats(userId),
    ]);

  if (!user) {
    return null;
  }

  return (
    <MobileShell title="프로필">
      <div className="space-y-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {user.displayName}
            </h2>
            <UserBadge role={user.role} />
          </div>
          <p className="mt-1 text-sm text-gray-500">{user.email}</p>
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
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
            <ProfileStatCard
              href="/me/records"
              value={user._count.records}
              label="기록"
            />
            <ProfileStatCard
              href="/following"
              value={friendCount}
              label="친구"
            />
            <FriendRequestStatCard
              initialCount={friendRequestCount}
              initialUnread={unreadFriendRequests}
            />
          </div>
        </div>

        <ProfileForm
          initialDisplayName={user.displayName}
          initialBio={user.bio}
          initialRole={user.role}
          initialTrainerProfile={{
            trainerRegion: user.trainerRegion,
            trainerGymName: user.trainerGymName,
            trainerPosition: user.trainerPosition,
            trainerCareer: user.trainerCareer,
          }}
        />
      </div>
    </MobileShell>
  );
}
