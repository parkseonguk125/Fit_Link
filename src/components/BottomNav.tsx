"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFriendRequestBadge } from "@/lib/friend-request-badge-client";
import { isNavTabActive, NAV_TABS } from "@/lib/nav-tabs";

export function BottomNav() {
  const pathname = usePathname();
  const { unread: unreadFriendRequests } = useFriendRequestBadge();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 flex h-14 w-full max-w-md -translate-x-1/2 border-t border-gray-200 bg-white px-2">
      {NAV_TABS.map((tab) => {
        const active = isNavTabActive(pathname, tab.href);
        const showProfileBadge = tab.href === "/me" && unreadFriendRequests;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-xs ${
              active ? "font-semibold text-[#4A90A4]" : "text-gray-500"
            }`}
          >
            <span className="relative text-lg leading-none" suppressHydrationWarning>
              {tab.icon}
              {showProfileBadge ? (
                <span
                  aria-label="새 친구 요청"
                  className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
                />
              ) : null}
            </span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
