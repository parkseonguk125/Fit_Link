import type { Role } from "@/generated/prisma/client";

export type FollowRequestUser = {
  id: string;
  displayName: string;
  bio: string;
  role: Role;
};
