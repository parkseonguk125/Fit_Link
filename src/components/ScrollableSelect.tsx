"use client";

import { useEffect, useRef, useState } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

const VISIBLE_ITEM_COUNT = 5;
const ITEM_HEIGHT_PX = 48;

type ScrollableSelectOption = {
  value: string;
  label: string;
};

type ScrollableSelectProps = {
  label: string;
  placeholder: string;
  value: string;
  options: ScrollableSelectOption[];
  onChange: (value: string) => void;
};

export function ScrollableSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
}: ScrollableSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? placeholder;

  function selectOption(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-12 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 text-left text-sm outline-none focus:border-[#4A90A4]"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {selectedLabel}
        </span>
        <span className="ml-2 shrink-0 text-gray-400" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute z-20 mt-1 w-full touch-pan-y overscroll-y-contain overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
          style={{ maxHeight: ITEM_HEIGHT_PX * VISIBLE_ITEM_COUNT }}
        >
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => selectOption("")}
              className={`flex min-h-12 w-full items-center px-4 text-left text-sm ${
                !value
                  ? "bg-[#4A90A4]/10 font-medium text-[#4A90A4]"
                  : "text-gray-400 hover:bg-gray-50"
              }`}
            >
              {placeholder}
            </button>
          </li>
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => selectOption(option.value)}
                  className={`flex min-h-12 w-full items-center px-4 text-left text-sm ${
                    selected
                      ? "bg-[#4A90A4]/10 font-medium text-[#4A90A4]"
                      : "text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
