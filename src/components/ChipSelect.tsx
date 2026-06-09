export function ChipSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  singleRow = false,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  singleRow?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>
      <div
        className={
          singleRow
            ? "flex flex-nowrap gap-1"
            : "flex flex-wrap gap-2"
        }
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-full ${
                singleRow
                  ? "min-h-9 min-w-0 flex-1 px-1 text-xs"
                  : "min-h-12 px-4 text-sm"
              } ${
                selected
                  ? "bg-[#4A90A4] text-white"
                  : "bg-white text-gray-700 ring-1 ring-gray-200"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
