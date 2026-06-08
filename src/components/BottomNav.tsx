"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/feed", label: "홈", icon: "🏠" },
  { href: "/records/new", label: "기록", icon: "✏️" },
  { href: "/me/records", label: "내 기록", icon: "📋" },
  { href: "/me", label: "프로필", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 flex h-14 w-full max-w-md -translate-x-1/2 border-t border-gray-200 bg-white px-2">
      {tabs.map((tab) => {
        const active =
          pathname === tab.href ||
          (tab.href !== "/feed" && pathname.startsWith(tab.href));

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-xs ${
              active ? "text-[#4A90A4] font-semibold" : "text-gray-500"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
