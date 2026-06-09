"use client";

import { useEffect, useState } from "react";
import { isSameDisplayName } from "@/lib/form-validation";

export function useDisplayNameAvailability(
  displayName: string,
  initialDisplayName?: string,
) {
  const [taken, setTaken] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      setTaken(false);
      setChecking(false);
      return;
    }

    if (
      initialDisplayName &&
      isSameDisplayName(trimmed, initialDisplayName)
    ) {
      setTaken(false);
      setChecking(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setChecking(true);
      try {
        const params = new URLSearchParams({ displayName: trimmed });
        const response = await fetch(
          `/api/users/check-display-name?${params.toString()}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          setTaken(true);
          return;
        }
        const data = (await response.json()) as { available?: boolean };
        setTaken(data.available === false);
      } catch (checkError) {
        if (!controller.signal.aborted) {
          setTaken(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setChecking(false);
        }
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [displayName, initialDisplayName]);

  return { taken, checking };
}
