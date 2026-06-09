"use client";

import { useState, useTransition } from "react";
import { signOutAfterAccountDeletion, signOutToLogin } from "@/lib/sign-out-client";
import { FieldHint } from "@/components/FieldHint";
import { TrainerProfileFields } from "@/components/TrainerProfileFields";
import { useDisplayNameAvailability } from "@/hooks/useDisplayNameAvailability";
import { verifyDisplayNameAvailable } from "@/lib/check-display-name-client";
import { deleteAccount, updateProfile } from "@/lib/actions";
import { ROLE_OPTIONS } from "@/lib/constants";
import { DISPLAY_NAME_TAKEN_HINT } from "@/lib/form-validation";
import {
  emptyTrainerProfile,
  type TrainerProfile,
} from "@/lib/trainer-profile";

export function ProfileForm({
  initialDisplayName,
  initialBio,
  initialRole,
  initialTrainerProfile = emptyTrainerProfile,
}: {
  initialDisplayName: string;
  initialBio: string;
  initialRole: "USER" | "TRAINER";
  initialTrainerProfile?: TrainerProfile;
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [role, setRole] = useState<"USER" | "TRAINER">(initialRole);
  const [trainerProfile, setTrainerProfile] =
    useState<TrainerProfile>(initialTrainerProfile);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const { taken: displayNameTaken } = useDisplayNameAvailability(
    displayName,
    initialDisplayName,
  );
  const displayNameHint =
    displayName.trim() && displayNameTaken ? DISPLAY_NAME_TAKEN_HINT : undefined;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (displayNameHint) {
      alert(displayNameHint);
      return;
    }

    startTransition(async () => {
      const nameCheck = await verifyDisplayNameAvailable(displayName);
      if (!nameCheck.available) {
        const message = nameCheck.message ?? DISPLAY_NAME_TAKEN_HINT;
        setError(message);
        alert(message);
        return;
      }

      try {
        await updateProfile({
          displayName,
          bio,
          role,
          ...(role === "TRAINER" ? trainerProfile : {}),
        });
        setMessage("프로필이 저장되었습니다.");
      } catch (updateError) {
        const message =
          updateError instanceof Error
            ? updateError.message
            : "저장 중 오류가 발생했습니다.";
        setError(message);
        if (message === DISPLAY_NAME_TAKEN_HINT) {
          alert(message);
        }
      }
    });
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "회원 탈퇴 시 닉네임, 이메일, 비밀번호를 포함한 계정 정보와 작성한 기록·댓글이 모두 삭제됩니다. 탈퇴하시겠습니까?",
    );
    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");
    setIsDeleting(true);

    try {
      await deleteAccount();
      await signOutAfterAccountDeletion();
    } catch (deleteError) {
      setIsDeleting(false);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "회원 탈퇴 중 오류가 발생했습니다.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          닉네임
        </label>
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="min-h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-[#4A90A4]"
        />
        <FieldHint message={displayNameHint} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          한 줄 소개
        </label>
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#4A90A4]"
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">역할</p>
        <div className="flex gap-2">
          {ROLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRole(option.value)}
              className={`min-h-12 flex-1 rounded-xl text-sm ${
                role === option.value
                  ? "bg-[#4A90A4] text-white"
                  : "bg-gray-50 text-gray-700 ring-1 ring-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {role === "TRAINER" ? (
          <TrainerProfileFields
            profile={trainerProfile}
            onChange={setTrainerProfile}
          />
        ) : null}
      </div>
      {message ? <p className="text-sm text-green-600">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isPending || Boolean(displayNameHint)}
        className="min-h-12 w-full rounded-xl bg-[#4A90A4] text-sm font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "저장 중..." : "프로필 저장"}
      </button>
      <button
        type="button"
        onClick={() => signOutToLogin()}
        className="min-h-12 w-full rounded-xl bg-gray-100 text-sm font-semibold text-gray-700"
      >
        로그아웃
      </button>
      <button
        type="button"
        onClick={handleDeleteAccount}
        disabled={isDeleting || isPending}
        className="min-h-12 w-full rounded-xl border border-red-200 bg-white text-sm font-semibold text-red-600 disabled:opacity-60"
      >
        {isDeleting ? "탈퇴 처리 중..." : "회원 탈퇴"}
      </button>
    </form>
  );
}
