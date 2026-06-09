"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { PlaceResult } from "@/lib/places/types";

const TrainerLocationMap = dynamic(
  () =>
    import("@/components/TrainerLocationMap").then(
      (module) => module.TrainerLocationMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-gray-500">
        지도 불러오는 중...
      </div>
    ),
  },
);

const DEFAULT_LAT = 37.5665;
const DEFAULT_LON = 126.978;

export function TrainerLocationPickerModal({
  open,
  initialRegion,
  initialGymName,
  onClose,
  onSelect,
}: {
  open: boolean;
  initialRegion: string;
  initialGymName: string;
  onClose: () => void;
  onSelect: (selection: { region: string; gymName: string }) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [selected, setSelected] = useState<PlaceResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const seed = [initialGymName, initialRegion].filter(Boolean).join(" ");
    setQuery(seed);
    setResults([]);
    setSelected(null);
    setError("");
  }, [open, initialGymName, initialRegion]);

  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setError("");

      try {
        const response = await fetch(
          `/api/places/search?q=${encodeURIComponent(trimmed)}`,
        );
        const data = (await response.json()) as {
          results?: PlaceResult[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "검색에 실패했습니다.");
        }

        setResults(data.results ?? []);
      } catch (searchError) {
        setResults([]);
        setError(
          searchError instanceof Error
            ? searchError.message
            : "검색 중 오류가 발생했습니다.",
        );
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [open, query]);

  async function resolveMapClick(lat: number, lon: number) {
    setIsResolving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/places/reverse?lat=${lat}&lon=${lon}`,
      );
      const data = (await response.json()) as {
        result?: PlaceResult;
        error?: string;
      };

      if (!response.ok || !data.result) {
        throw new Error(data.error ?? "위치를 확인할 수 없습니다.");
      }

      setSelected(data.result);
    } catch (resolveError) {
      setError(
        resolveError instanceof Error
          ? resolveError.message
          : "위치 확인 중 오류가 발생했습니다.",
      );
    } finally {
      setIsResolving(false);
    }
  }

  function handleConfirm() {
    if (!selected) {
      setError("지도에서 위치를 선택해 주세요.");
      return;
    }

    onSelect({
      region:
        selected.region || selected.addressLabel.split(",")[0]?.trim() || "",
      gymName: selected.gymName || selected.name,
    });
  }

  if (!open) {
    return null;
  }

  const mapLat = selected?.lat ?? DEFAULT_LAT;
  const mapLon = selected?.lon ?? DEFAULT_LON;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              지도에서 찾기
            </h3>
            <p className="text-xs text-gray-500">
              헬스장·지역을 검색하거나 지도를 눌러 선택하세요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
          >
            닫기
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto p-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="예: 강남 헬스장, OO피트니스"
            className="min-h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#4A90A4]"
          />

          {isSearching ? (
            <p className="text-xs text-gray-500">검색 중...</p>
          ) : null}

          {results.length > 0 ? (
            <ul className="max-h-40 space-y-2 overflow-y-auto rounded-xl bg-gray-50 p-2">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(result)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      selected?.id === result.id
                        ? "bg-[#4A90A4] text-white"
                        : "bg-white text-gray-800 ring-1 ring-gray-200 hover:bg-[#4A90A4]/5"
                    }`}
                  >
                    <p className="font-medium">{result.name}</p>
                    <p
                      className={`mt-0.5 text-xs ${
                        selected?.id === result.id
                          ? "text-white/80"
                          : "text-gray-500"
                      }`}
                    >
                      {result.addressLabel}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim().length >= 2 && !isSearching ? (
            <p className="text-xs text-gray-500">
              검색 결과가 없으면 지도를 직접 눌러 선택할 수 있어요.
            </p>
          ) : null}

          <div className="overflow-hidden rounded-xl ring-1 ring-gray-200">
            <div className="h-56">
              <TrainerLocationMap
                key={`${mapLat}-${mapLon}`}
                lat={mapLat}
                lon={mapLon}
                onMapClick={resolveMapClick}
              />
            </div>
          </div>

          {isResolving ? (
            <p className="text-xs text-gray-500">선택한 위치 확인 중...</p>
          ) : null}

          {selected ? (
            <div className="rounded-xl bg-[#4A90A4]/5 p-3 text-sm ring-1 ring-[#4A90A4]/10">
              <p className="font-medium text-gray-900">{selected.name}</p>
              <p className="mt-1 text-xs text-gray-600">
                지역: {selected.region || "확인 필요"}
              </p>
              <p className="text-xs text-gray-600">
                헬스장: {selected.gymName || selected.name}
              </p>
            </div>
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="border-t border-gray-100 p-4">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selected || isResolving}
            className="min-h-11 w-full rounded-xl bg-[#4A90A4] text-sm font-semibold text-white disabled:opacity-60"
          >
            이 위치 선택
          </button>
        </div>
      </div>
    </div>
  );
}
