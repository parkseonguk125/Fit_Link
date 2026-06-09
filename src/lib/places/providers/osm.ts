import { parseNominatimItem, parseNominatimReverse } from "@/lib/places/parse-nominatim";
import { nominatimFetch } from "@/lib/places/nominatim";
import type { NominatimReverseResult, NominatimSearchItem, PlaceResult } from "@/lib/places/types";

export async function searchOsm(query: string): Promise<PlaceResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    addressdetails: "1",
    countrycodes: "kr",
    limit: "8",
    "accept-language": "ko",
  });

  const items = (await nominatimFetch("/search", params)) as NominatimSearchItem[];
  return items.map(parseNominatimItem);
}

export async function reverseOsm(lat: number, lon: number): Promise<PlaceResult> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: "json",
    addressdetails: "1",
    "accept-language": "ko",
  });

  const item = (await nominatimFetch(
    "/reverse",
    params,
  )) as NominatimReverseResult;

  return parseNominatimReverse(item);
}
