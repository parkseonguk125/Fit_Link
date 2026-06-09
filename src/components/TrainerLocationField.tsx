function MapPinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z"
      />
      <circle cx="12" cy="11" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TrainerLocationField({
  label,
  value,
  placeholder,
  onChange,
  onOpenMap,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onOpenMap: () => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-600">
        {label}
      </label>
      <div className="relative">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-11 w-full rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-11 text-sm outline-none focus:border-[#4A90A4]"
        />
        <button
          type="button"
          aria-label={`${label} 지도에서 찾기`}
          onClick={onOpenMap}
          className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 appearance-none items-center justify-center rounded-lg text-[#4A90A4] hover:bg-[#4A90A4]/10"
        >
          <MapPinIcon />
        </button>
      </div>
    </div>
  );
}
