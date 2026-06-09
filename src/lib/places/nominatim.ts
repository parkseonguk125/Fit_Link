const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "FitLink/1.0 (exercise-log; contact@local.dev)";

export async function nominatimFetch(path: string, params: URLSearchParams) {
  const url = `${NOMINATIM_BASE}${path}?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error("장소 검색 서비스에 연결할 수 없습니다.");
  }

  return response.json();
}
