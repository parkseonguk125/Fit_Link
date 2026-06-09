"use client";

import { useState } from "react";
import { TrainerLocationField } from "@/components/TrainerLocationField";
import { TrainerLocationPickerModal } from "@/components/TrainerLocationPickerModal";
import type { TrainerProfile } from "@/lib/trainer-profile";

export function TrainerProfileFields({
  profile,
  onChange,
}: {
  profile: TrainerProfile;
  onChange: (profile: TrainerProfile) => void;
}) {
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  function updateField(field: keyof TrainerProfile, value: string) {
    onChange({ ...profile, [field]: value });
  }

  return (
    <>
      <div className="mt-3 space-y-3 rounded-xl bg-[#4A90A4]/5 p-3 ring-1 ring-[#4A90A4]/10">
        <p className="text-xs font-medium text-[#4A90A4]">
          트레이너 정보 (인증용)
        </p>
        <TrainerLocationField
          label="지역"
          value={profile.trainerRegion}
          placeholder="예: 서울 강남구"
          onChange={(value) => updateField("trainerRegion", value)}
          onOpenMap={() => setLocationPickerOpen(true)}
        />
        <TrainerLocationField
          label="헬스장 이름"
          value={profile.trainerGymName}
          placeholder="예: OO피트니스"
          onChange={(value) => updateField("trainerGymName", value)}
          onOpenMap={() => setLocationPickerOpen(true)}
        />
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">
            직급
          </label>
          <input
            value={profile.trainerPosition}
            onChange={(event) =>
              updateField("trainerPosition", event.target.value)
            }
            placeholder="예: 팀장, 매니저, 지점장"
            className="min-h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#4A90A4]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">
            경력
          </label>
          <input
            value={profile.trainerCareer}
            onChange={(event) =>
              updateField("trainerCareer", event.target.value)
            }
            placeholder="예: 주니어 트레이너, 시니어 트레이너"
            className="min-h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#4A90A4]"
          />
        </div>
      </div>

      <TrainerLocationPickerModal
        open={locationPickerOpen}
        initialRegion={profile.trainerRegion}
        initialGymName={profile.trainerGymName}
        onClose={() => setLocationPickerOpen(false)}
        onSelect={({ region, gymName }) => {
          onChange({
            ...profile,
            trainerRegion: region,
            trainerGymName: gymName,
          });
          setLocationPickerOpen(false);
        }}
      />
    </>
  );
}
