import type { PlaceAddress } from "@/lib/places/types";

function simplifyState(value: string) {
  return value
    .replace(/특별자치도/g, "")
    .replace(/특별자치시/g, "")
    .replace(/특별시/g, "")
    .replace(/광역시/g, "")
    .trim();
}

export function formatKoreanRegion(address?: PlaceAddress): string {
  if (!address) return "";

  const stateRaw = address.state || address.city || "";
  const state = simplifyState(stateRaw);
  const district =
    address.borough ||
    address.county ||
    address.city_district ||
    address.suburb ||
    address.town ||
    "";

  if (state && district && district !== state && !district.startsWith(state)) {
    return `${state} ${district}`.trim();
  }

  return (district || state || stateRaw).trim();
}

export function buildGymName(
  name: string | undefined,
  displayName: string,
  type?: string,
  placeClass?: string,
): string {
  const trimmedName = name?.trim();
  if (trimmedName) {
    return trimmedName;
  }

  const firstPart = displayName.split(",")[0]?.trim() ?? "";
  const looksLikeGym =
    /헬스|피트니스|gym|fitness|체육관|트레이닝/i.test(firstPart) ||
    placeClass === "amenity" ||
    type === "fitness_centre";

  return looksLikeGym ? firstPart : "";
}

export function buildAddressLabel(displayName: string, region: string) {
  if (!displayName) return region;
  if (region && displayName.startsWith(region)) {
    return displayName;
  }
  return displayName;
}
