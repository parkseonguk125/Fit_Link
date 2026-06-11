"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isNavTabActive, NAV_TABS } from "@/lib/nav-tabs";

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-6 w-6"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-6 w-6"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function HeaderMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="메뉴 열기"
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200"
      >
        <MenuIcon />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          <aside
            id="mobile-nav-menu"
            role="dialog"
            aria-modal="true"
            aria-label="메뉴"
            className="absolute right-0 top-0 flex h-full w-[min(68vw,200px)] flex-col border-l border-white/40 bg-white/88 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-gray-200/70 px-3 py-3">
              <p className="text-sm font-semibold text-gray-900">메뉴</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="메뉴 닫기"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200"
              >
                <CloseIcon />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 p-2">
              {NAV_TABS.map((tab) => {
                const active = isNavTabActive(pathname, tab.href);

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    onClick={() => setOpen(false)}
                    className={`flex min-h-12 items-center gap-2.5 rounded-xl px-3 text-sm ${
                      active
                        ? "bg-[#4A90A4]/15 font-semibold text-[#4A90A4]"
                        : "text-gray-800 hover:bg-white/60 active:bg-white/80"
                    }`}
                  >
                    <span className="text-lg" aria-hidden suppressHydrationWarning>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
