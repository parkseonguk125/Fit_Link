import { prisma } from "@/lib/prisma";

export const DISPLAY_NAME_DUPLICATE_ERROR = "이미 사용 중인 닉네임입니다.";

export async function isDisplayNameTaken(
  displayName: string,
  excludeUserId?: string,
): Promise<boolean> {
  const trimmed = displayName.trim();
  if (!trimmed) {
    return false;
  }

  const rows = excludeUserId
    ? await prisma.$queryRaw<{ id: string }[]>`
        SELECT id
        FROM "User"
        WHERE LOWER(TRIM("displayName")) = LOWER(${trimmed})
          AND id <> ${excludeUserId}
        LIMIT 1
      `
    : await prisma.$queryRaw<{ id: string }[]>`
        SELECT id
        FROM "User"
        WHERE LOWER(TRIM("displayName")) = LOWER(${trimmed})
        LIMIT 1
      `;

  return rows.length > 0;
}

export async function assertDisplayNameAvailable(
  displayName: string,
  excludeUserId?: string,
): Promise<void> {
  if (await isDisplayNameTaken(displayName, excludeUserId)) {
    throw new Error(DISPLAY_NAME_DUPLICATE_ERROR);
  }
}
