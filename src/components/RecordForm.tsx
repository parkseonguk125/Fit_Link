"use client";

import { useState, useTransition } from "react";
import type {
  Category,
  ExercisePart,
  Visibility,
} from "@/generated/prisma/client";
import { AccordionField } from "@/components/AccordionField";
import { ChipSelect } from "@/components/ChipSelect";
import {
  CATEGORY_OPTIONS,
  EXERCISE_PART_OPTIONS,
  VISIBILITY_OPTIONS,
} from "@/lib/constants";
import { toDateInputValue } from "@/lib/format";
import { createRecord } from "@/lib/actions";
import { extractYoutubeId, youtubeThumbnailUrl } from "@/lib/youtube";

type UploadedImage = {
  url: string;
  storagePath?: string;
  preview: string;
};

export function RecordForm() {
  const [category, setCategory] = useState<Category>("EXERCISE");
  const [exercisePart, setExercisePart] = useState<ExercisePart>("CHEST");
  const [recordDate, setRecordDate] = useState(toDateInputValue(new Date()));
  const [visibility, setVisibility] = useState<Visibility>("PUBLIC");
  const [feltNote, setFeltNote] = useState("");
  const [hardNote, setHardNote] = useState("");
  const [lackingNote, setLackingNote] = useState("");
  const [questionNote, setQuestionNote] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  const youtubeId = extractYoutubeId(youtubeUrl);

  async function handleImageUpload(fileList: FileList | null) {
    if (!fileList?.length) return;

    setUploading(true);
    setError("");

    try {
      const uploaded: UploadedImage[] = [];

      for (const file of Array.from(fileList)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "업로드 실패");
        }

        uploaded.push({
          url: data.url,
          storagePath: data.storagePath,
          preview: URL.createObjectURL(file),
        });
      }

      setImages((prev) => [...prev, ...uploaded]);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "이미지 업로드 중 오류가 발생했습니다.",
      );
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        await createRecord({
          category,
          exercisePart: category === "EXERCISE" ? exercisePart : null,
          recordDate,
          feltNote,
          hardNote,
          lackingNote,
          questionNote,
          visibility,
          youtubeUrl,
          imageUrls: images.map((image) => ({
            url: image.url,
            storagePath: image.storagePath,
          })),
        });
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "저장 중 오류가 발생했습니다.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ChipSelect
        label="대분류"
        options={CATEGORY_OPTIONS}
        value={category}
        onChange={setCategory}
      />

      {category === "EXERCISE" ? (
        <ChipSelect
          label="운동 부위"
          options={EXERCISE_PART_OPTIONS}
          value={exercisePart}
          onChange={setExercisePart}
        />
      ) : null}

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          기록 날짜
        </label>
        <input
          type="date"
          value={recordDate}
          onChange={(event) => setRecordDate(event.target.value)}
          className="min-h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#4A90A4]"
        />
      </div>

      <ChipSelect
        label="공개 범위"
        options={VISIBILITY_OPTIONS}
        value={visibility}
        onChange={setVisibility}
      />

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">사진</p>
        <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-sm text-gray-600">
          {uploading ? "업로드 중..." : "+ 사진 추가"}
          <input
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            className="hidden"
            onChange={(event) => handleImageUpload(event.target.files)}
          />
        </label>
        {images.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {images.map((image) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={image.url}
                src={image.preview}
                alt="업로드 미리보기"
                className="h-24 w-full rounded-lg object-cover"
              />
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          유튜브 URL
        </label>
        <input
          type="url"
          value={youtubeUrl}
          onChange={(event) => setYoutubeUrl(event.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="min-h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#4A90A4]"
        />
        {youtubeId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={youtubeThumbnailUrl(youtubeId)}
            alt="유튜브 미리보기"
            className="mt-3 h-40 w-full rounded-lg object-cover"
          />
        ) : null}
      </div>

      <div className="space-y-3">
        <AccordionField
          title="오늘 느낀 점"
          value={feltNote}
          onChange={setFeltNote}
          placeholder="오늘 운동/식단에서 느낀 점"
        />
        <AccordionField
          title="힘들었던 점"
          value={hardNote}
          onChange={setHardNote}
        />
        <AccordionField
          title="부족한 점"
          value={lackingNote}
          onChange={setLackingNote}
        />
        <AccordionField
          title="알고 싶은 점"
          value={questionNote}
          onChange={setQuestionNote}
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isPending || uploading}
        className="fixed bottom-16 left-1/2 z-40 min-h-12 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl bg-[#4A90A4] text-sm font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "저장 중..." : "기록 저장"}
      </button>
    </form>
  );
}
