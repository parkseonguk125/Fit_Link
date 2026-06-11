"use client";

import { signOut } from "next-auth/react";

function clearAuthCookies() {
  for (const entry of document.cookie.split(";")) {
    const name = entry.split("=")[0]?.trim();
    if (!name) {
      continue;
    }
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
  }
}

export async function signOutToLogin() {
  await signOut({ redirect: false });
  clearAuthCookies();
  window.location.replace("/");
}

export async function signOutAfterAccountDeletion() {
  await signOut({ redirect: false });
  clearAuthCookies();
  window.location.replace("/login");
}
