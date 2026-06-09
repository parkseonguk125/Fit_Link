type TrainerProfile = {
  trainerRegion: string;
  trainerGymName: string;
  trainerPosition: string;
  trainerCareer: string;
};

export function TrainerProfileSummary({
  profile,
}: {
  profile: TrainerProfile;
}) {
  const items = [
    { label: "지역", value: profile.trainerRegion },
    { label: "헬스장", value: profile.trainerGymName },
    { label: "직급", value: profile.trainerPosition },
    { label: "경력", value: profile.trainerCareer },
  ].filter((item) => item.value.trim());

  if (items.length === 0) {
    return null;
  }

  return (
    <dl className="mt-3 space-y-1.5 rounded-lg bg-[#4A90A4]/5 p-3 text-sm">
      {items.map((item) => (
        <div key={item.label} className="flex gap-2">
          <dt className="w-14 shrink-0 text-xs font-medium text-gray-500">
            {item.label}
          </dt>
          <dd className="text-gray-800">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
