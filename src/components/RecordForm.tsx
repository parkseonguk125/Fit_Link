"use client";

import { useState, useTransition } from "react";
import type {
  Category,
  ExercisePart,
} from "@/generated/prisma/client";
import { ChipSelect } from "@/components/ChipSelect";
import {
  DietCalorieInput,
  dietItemsToPayload,
  type DietItemDraft,
} from "@/components/DietCalorieInput";
import {
  CardioInfoInput,
  cardioInfoToPayload,
  EMPTY_CARDIO_INFO,
  type CardioInfoDraft,
} from "@/components/CardioInfoInput";
import {
  ExerciseLogInput,
  createEmptyExerciseBlock,
  exerciseLogToPayload,
  type ExerciseBlockDraft,
} from "@/components/ExerciseLogInput";
import {
  CATEGORY_OPTIONS,
  EXERCISE_PART_OPTIONS,
} from "@/lib/constants";
import { toDateInputValue } from "@/lib/format";
import { createRecord } from "@/lib/actions";
import { createClientId } from "@/lib/create-id";
import { linkDisplayHost, parseLinkUrl } from "@/lib/link-url";
import { extractYoutubeId, youtubeThumbnailUrl } from "@/lib/youtube";

type UploadedImage = {
  id: string;
  url: string;
  storagePath?: string;
  preview: string;
};

const EMPTY_IMAGES_BY_CATEGORY: Record<Category, UploadedImage[]> = {
  DIET: [],
  EXERCISE: [],
  CARDIO: [],
};

export function RecordForm() {
  const [category, setCategory] = useState<Category>("EXERCISE");
  const [exercisePart, setExercisePart] = useState<ExercisePart>("CHEST");
  const [recordDate, setRecordDate] = useState(toDateInputValue(new Date()));
  const [memo, setMemo] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imagesByCategory, setImagesByCategory] = useState(EMPTY_IMAGES_BY_CATEGORY);
  const [dietItems, setDietItems] = useState<DietItemDraft[]>([]);
  const [cardioInfo, setCardioInfo] = useState<CardioInfoDraft>(EMPTY_CARDIO_INFO);
  const [exerciseBlocks, setExerciseBlocks] = useState<ExerciseBlockDraft[]>([
    createEmptyExerciseBlock(),
  ]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  const images = imagesByCategory[category];

  const youtubeId = extractYoutubeId(linkUrl);
  const parsedLink = parseLinkUrl(linkUrl);

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
          id: createClientId(),
          url: data.url,
          storagePath: data.storagePath,
          preview: URL.createObjectURL(file),
        });
      }

      setImagesByCategory((prev) => ({
        ...prev,
        [category]: [...prev[category], ...uploaded],
      }));
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

  function handleRemoveImage(imageId: string) {
    setImagesByCategory((prev) => {
      const target = prev[category].find((image) => image.id === imageId);
      if (target?.preview.startsWith("blob:")) {
        URL.revokeObjectURL(target.preview);
      }
      return {
        ...prev,
        [category]: prev[category].filter((image) => image.id !== imageId),
      };
    });
  }

  function saveRecord() {
    setError("");

    startTransition(async () => {
      try {
        const trimmedLinkUrl = linkUrl.trim();
        if (trimmedLinkUrl && !parseLinkUrl(trimmedLinkUrl)) {
          setError("올바른 URL을 입력해 주세요.");
          return;
        }

        await createRecord({
          category,
          exercisePart: category === "EXERCISE" ? exercisePart : null,
          recordDate,
          feltNote: memo,
          linkUrl: trimmedLinkUrl,
          imageUrls: images.map((image) => ({
            url: image.url,
            storagePath: image.storagePath,
          })),
          dietItems:
            category === "DIET" ? dietItemsToPayload(dietItems) : undefined,
          ...(category === "CARDIO" ? cardioInfoToPayload(cardioInfo) : {}),
          ...(category === "EXERCISE"
            ? { exerciseEntries: exerciseLogToPayload(exerciseBlocks) }
            : {}),
        });
      } catch (submitError) {
        if (
          submitError &&
          typeof submitError === "object" &&
          "digest" in submitError &&
          String((submitError as { digest?: string }).digest).includes(
            "NEXT_REDIRECT",
          )
        ) {
          throw submitError;
        }
        setError(
          submitError instanceof Error
            ? submitError.message
            : "저장 중 오류가 발생했습니다.",
        );
      }
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveRecord();
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
        <>
          <ChipSelect
            label="운동 부위"
            options={EXERCISE_PART_OPTIONS}
            value={exercisePart}
            onChange={(part) => {
              setExercisePart(part);
              setExerciseBlocks([createEmptyExerciseBlock()]);
            }}
            singleRow
          />
          <ExerciseLogInput
            exercisePart={exercisePart}
            value={exerciseBlocks}
            onChange={setExerciseBlocks}
          />
        </>
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

      {category === "DIET" ? (
        <DietCalorieInput items={dietItems} onChange={setDietItems} />
      ) : null}

      {category === "CARDIO" ? (
        <CardioInfoInput value={cardioInfo} onChange={setCardioInfo} />
      ) : null}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">사진</p>
          {images.length > 0 ? (
            <span className="text-xs text-gray-500">{images.length}장</span>
          ) : null}
        </div>
        <p className="mb-2 text-xs text-gray-500">
          {category === "DIET"
            ? "식단"
            : category === "EXERCISE"
              ? "운동"
              : "유산소"}
          기록에만 저장돼요. 여러 장을 한 번에 선택하거나 추가할 수 있어요.
        </p>
        <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-sm text-gray-600">
          {uploading ? "업로드 중..." : "+ 사진 추가"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              void handleImageUpload(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
        {images.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {images.map((image, index) => (
              <div key={image.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.preview}
                  alt={`업로드 미리보기 ${index + 1}`}
                  className="h-24 w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  aria-label={`사진 ${index + 1} 삭제`}
                  onClick={() => handleRemoveImage(image.id)}
                  className="absolute right-1 top-1 rounded-full bg-black/55 px-2 py-0.5 text-xs text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          링크 URL
        </label>
        <input
          type="text"
          inputMode="url"
          value={linkUrl}
          onChange={(event) => setLinkUrl(event.target.value)}
          placeholder="https://..."
          className="min-h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#4A90A4]"
        />
        {youtubeId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={youtubeThumbnailUrl(youtubeId)}
            alt="유튜브 미리보기"
            className="mt-3 h-40 w-full rounded-lg object-cover"
          />
        ) : parsedLink?.mediaType === "LINK" ? (
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <span className="text-lg">🔗</span>
            <span className="min-w-0 truncate text-sm text-gray-700">
              {linkDisplayHost(parsedLink.url)}
            </span>
          </div>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          메모
        </label>
        <textarea
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          placeholder="오늘 기록에 대한 메모를 자유롭게 작성해 주세요."
          rows={5}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#4A90A4]"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="button"
        disabled={isPending || uploading}
        onClick={saveRecord}
        className="min-h-12 w-full rounded-xl bg-[#4A90A4] text-sm font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "저장 중..." : "기록 저장"}
      </button>
    </form>
  );
}
