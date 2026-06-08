"use client";

import { useState } from "react";

export function AccordionField({
  title,
  value,
  onChange,
  placeholder,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl bg-white ring-1 ring-gray-200">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-12 w-full items-center justify-between px-4 text-left text-sm font-medium text-gray-800"
      >
        <span>{title}</span>
        <span className="text-gray-400">{open ? "▲" : "▼"}</span>
      </button>
      {open ? (
        <div className="border-t border-gray-100 px-4 pb-4">
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            rows={4}
            className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#4A90A4]"
          />
        </div>
      ) : null}
    </div>
  );
}
