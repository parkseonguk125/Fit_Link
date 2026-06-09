"use client";

import { useEffect, useState } from "react";

type GalleryImage = {
  id: string;
  url: string;
};

export function RecordImageGallery({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((index) =>
          index === null ? null : (index - 1 + images.length) % images.length,
        );
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((index) =>
          index === null ? null : (index + 1) % images.length,
        );
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, images.length]);

  if (images.length === 0) {
    return null;
  }

  const gridClass =
    images.length === 1
      ? "grid-cols-1"
      : images.length === 2
        ? "grid-cols-2"
        : "grid-cols-3";

  return (
    <>
      <div className={`grid gap-2 ${gridClass}`}>
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`relative overflow-hidden rounded-xl bg-gray-100 ${
              images.length === 1 ? "aspect-[4/3]" : "aspect-square"
            }`}
            aria-label={`사진 ${index + 1} 크게 보기`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={`기록 사진 ${index + 1}`}
              className="h-full w-full object-cover"
            />
            {images.length > 1 ? (
              <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-xs text-white">
                {index + 1}/{images.length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {activeIndex !== null ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setActiveIndex(null)}
            className="absolute right-4 top-4 rounded-full bg-white/15 px-3 py-2 text-sm text-white"
          >
            닫기
          </button>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="이전 사진"
                onClick={() =>
                  setActiveIndex(
                    (activeIndex - 1 + images.length) % images.length,
                  )
                }
                className="absolute left-3 rounded-full bg-white/15 px-3 py-2 text-white"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="다음 사진"
                onClick={() =>
                  setActiveIndex((activeIndex + 1) % images.length)
                }
                className="absolute right-3 rounded-full bg-white/15 px-3 py-2 text-white"
              >
                ›
              </button>
              <p className="absolute bottom-4 text-sm text-white/80">
                {activeIndex + 1} / {images.length}
              </p>
            </>
          ) : null}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeIndex].url}
            alt={`기록 사진 ${activeIndex + 1}`}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      ) : null}
    </>
  );
}
