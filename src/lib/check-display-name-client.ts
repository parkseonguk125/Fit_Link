import { DISPLAY_NAME_TAKEN_HINT } from "@/lib/form-validation";

export async function verifyDisplayNameAvailable(
  displayName: string,
): Promise<{ available: boolean; message?: string }> {
  const trimmed = displayName.trim();
  if (!trimmed) {
    return { available: false, message: "닉네임을 입력해 주세요." };
  }

  const params = new URLSearchParams({ displayName: trimmed });
  const response = await fetch(
    `/api/users/check-display-name?${params.toString()}`,
  );

  if (!response.ok) {
    return { available: false, message: "닉네임 확인에 실패했습니다." };
  }

  const data = (await response.json()) as { available?: boolean };
  if (data.available === false) {
    return { available: false, message: DISPLAY_NAME_TAKEN_HINT };
  }

  return { available: true };
}
