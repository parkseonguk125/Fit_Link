import {
  buildAddressLabel,
  buildGymName,
  formatKoreanRegion,
} from "@/lib/places/format-region";
import type { NominatimReverseResult, NominatimSearchItem, PlaceResult } from "@/lib/places/types";

export function parseNominatimItem(item: NominatimSearchItem): PlaceResult {
  const region = formatKoreanRegion(item.address);
  const gymName = buildGymName(
    item.name,
    item.display_name,
    item.type,
    item.class,
  );

  return {
    id: String(item.place_id),
    name: item.name?.trim() || item.display_name.split(",")[0]?.trim() || "선택한 위치",
    region,
    gymName,
    addressLabel: buildAddressLabel(item.display_name, region),
    lat: Number(item.lat),
    lon: Number(item.lon),
  };
}

export function parseNominatimReverse(item: NominatimReverseResult): PlaceResult {
  const region = formatKoreanRegion(item.address);
  const gymName = buildGymName(item.name, item.display_name);

  return {
    id: String(item.place_id),
    name: item.name?.trim() || region || "선택한 위치",
    region,
    gymName,
    addressLabel: buildAddressLabel(item.display_name, region),
    lat: Number(item.lat),
    lon: Number(item.lon),
  };
}
