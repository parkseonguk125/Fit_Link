import { MobileShell } from "@/components/MobileShell";
import { ProfileForm } from "@/components/ProfileForm";
import { UserSearch } from "@/components/UserSearch";
import { UserBadge } from "@/components/UserBadge";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    include: {
      _count: {
        select: {
          records: true,
          followers: true,
          following: true,
        },
      },
    },
  });

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
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="font-semibold text-gray-900">{user._count.records}</p>
              <p className="text-xs text-gray-500">기록</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="font-semibold text-gray-900">{user._count.followers}</p>
              <p className="text-xs text-gray-500">팔로워</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="font-semibold text-gray-900">{user._count.following}</p>
              <p className="text-xs text-gray-500">팔로우</p>
            </div>
          </div>
        </div>

        <ProfileForm
          initialDisplayName={user.displayName}
          initialBio={user.bio}
          initialRole={user.role}
        />

        <UserSearch />
      </div>
    </MobileShell>
  );
}
