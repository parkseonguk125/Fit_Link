import type { Role } from "@/generated/prisma/client";
import { roleLabel } from "@/lib/constants";

export function UserBadge({ role }: { role: Role }) {
  if (role !== "TRAINER") return null;

  return (
    <span className="inline-flex rounded-full bg-[#4A90A4] px-2 py-0.5 text-xs font-medium text-white">
      {roleLabel(role)}
    </span>
  );
}
