"use client";

import { useEffect } from "react";

/** 친구 요청 페이지 진입 시 하단 네비 배지를 즉시 갱신 */
export function FriendRequestsSeenNotifier() {
  useEffect(() => {
    window.dispatchEvent(new Event("follow-requests-updated"));
  }, []);

  return null;
}
