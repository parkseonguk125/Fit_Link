"use client";

import { useSyncExternalStore } from "react";

export type FriendRequestBadgeState = {
  unread: boolean;
  count: number;
};

const DEFAULT_STATE: FriendRequestBadgeState = { unread: false, count: 0 };

const DEFAULT_SNAPSHOT = { ...DEFAULT_STATE, ready: false };

let state: FriendRequestBadgeState = DEFAULT_STATE;
let ready = false;
let snapshot = DEFAULT_SNAPSHOT;
const listeners = new Set<() => void>();
let eventSource: EventSource | null = null;
let subscriberCount = 0;
let fallbackIntervalId: number | null = null;
let reconnectTimeoutId: number | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(next: FriendRequestBadgeState) {
  const becameReady = !ready;
  ready = true;
  if (
    !becameReady &&
    state.unread === next.unread &&
    state.count === next.count
  ) {
    return;
  }
  state = next;
  snapshot = { ...state, ready: true };
  emit();
}

export async function refreshFriendRequestBadge() {
  try {
    const response = await fetch("/api/users/follow-request-count");
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as {
      unread?: boolean;
      count?: number;
    };
    setState({
      unread: data.unread ?? false,
      count: data.count ?? 0,
    });
  } catch {
    // ignore
  }
}

function stopFallbackPolling() {
  if (fallbackIntervalId !== null) {
    window.clearInterval(fallbackIntervalId);
    fallbackIntervalId = null;
  }
}

function startFallbackPolling() {
  if (fallbackIntervalId !== null) {
    return;
  }
  fallbackIntervalId = window.setInterval(refreshFriendRequestBadge, 5000);
}

function clearReconnectTimeout() {
  if (reconnectTimeoutId !== null) {
    window.clearTimeout(reconnectTimeoutId);
    reconnectTimeoutId = null;
  }
}

function scheduleReconnect() {
  clearReconnectTimeout();
  reconnectTimeoutId = window.setTimeout(() => {
    reconnectTimeoutId = null;
    if (subscriberCount > 0) {
      connectStream();
    }
  }, 3000);
}

function connectStream() {
  if (typeof window === "undefined" || eventSource) {
    return;
  }

  eventSource = new EventSource("/api/users/follow-request-stream");

  eventSource.onmessage = (event) => {
    stopFallbackPolling();
    try {
      const data = JSON.parse(event.data) as {
        unread?: boolean;
        count?: number;
      };
      setState({
        unread: data.unread ?? false,
        count: data.count ?? 0,
      });
    } catch {
      // ignore malformed payloads
    }
  };

  eventSource.onerror = () => {
    eventSource?.close();
    eventSource = null;
    startFallbackPolling();
    scheduleReconnect();
  };
}

function disconnectStream() {
  clearReconnectTimeout();
  eventSource?.close();
  eventSource = null;
  stopFallbackPolling();
}

function handleVisibilityChange() {
  if (document.visibilityState !== "visible") {
    return;
  }
  refreshFriendRequestBadge();
  if (!eventSource) {
    connectStream();
  }
}

function handleFollowRequestsUpdated() {
  refreshFriendRequestBadge();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  subscriberCount += 1;

  if (subscriberCount === 1) {
    refreshFriendRequestBadge();
    connectStream();
    window.addEventListener("follow-requests-updated", handleFollowRequestsUpdated);
    window.addEventListener("focus", refreshFriendRequestBadge);
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  return () => {
    listeners.delete(listener);
    subscriberCount -= 1;

    if (subscriberCount === 0) {
      disconnectStream();
      window.removeEventListener(
        "follow-requests-updated",
        handleFollowRequestsUpdated,
      );
      window.removeEventListener("focus", refreshFriendRequestBadge);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      state = DEFAULT_STATE;
      ready = false;
      snapshot = DEFAULT_SNAPSHOT;
    }
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return DEFAULT_SNAPSHOT;
}

export function useFriendRequestBadge() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
