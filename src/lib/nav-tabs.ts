export const NAV_TABS = [
  { href: "/me/records", label: "내 기록", icon: "📋" },
  { href: "/records/new", label: "기록", icon: "✏️" },
  { href: "/following", label: "친구", icon: "👥" },
  { href: "/me", label: "프로필", icon: "👤" },
] as const;

export const DEFAULT_APP_PATH = "/me/records";

export function isNavTabActive(pathname: string, href: string) {
  if (pathname === href) {
    return true;
  }

  switch (href) {
    case "/records/new":
      return pathname.startsWith("/records/") && !pathname.startsWith("/me/");
    case "/me/records":
      return pathname.startsWith("/me/records");
    case "/following":
      return pathname.startsWith("/following");
    case "/me":
      return pathname === "/me";
    default:
      return false;
  }
}
