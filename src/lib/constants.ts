import type { CardioType, Category, ExercisePart, Role, Visibility } from "@/generated/prisma/client";

export const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "DIET", label: "식단" },
  { value: "EXERCISE", label: "운동" },
  { value: "CARDIO", label: "유산소" },
];

export const EXERCISE_PART_OPTIONS: { value: ExercisePart; label: string }[] = [
  { value: "CHEST", label: "가슴" },
  { value: "SHOULDER", label: "어깨" },
  { value: "BACK", label: "등" },
  { value: "LEGS", label: "하체" },
  { value: "ARMS", label: "팔" },
  { value: "CORE", label: "코어" },
  { value: "OTHER", label: "기타" },
];

export const CARDIO_TYPE_OPTIONS: { value: CardioType; label: string }[] = [
  { value: "RUNNING", label: "러닝" },
  { value: "CYCLING", label: "사이클" },
  { value: "WALKING", label: "걷기" },
  { value: "SWIMMING", label: "수영" },
  { value: "HIIT", label: "HIIT" },
  { value: "ROWING", label: "로잉" },
  { value: "ELLIPTICAL", label: "일립티컬" },
  { value: "JUMP_ROPE", label: "줄넘기" },
  { value: "TRACKING", label: "트래킹" },
  { value: "HIKING", label: "등산" },
  { value: "SPINNING", label: "스피닝" },
  { value: "AEROBICS", label: "에어로빅" },
  { value: "ZUMBA", label: "줌바댄스" },
  { value: "BROADCAST_DANCE", label: "방송댄스" },
  { value: "SPORTS_DANCE", label: "스포츠댄스" },
  { value: "STAIRMASTER", label: "천국의 계단" },
  { value: "OTHER", label: "기타" },
];

export const VISIBILITY_OPTIONS: { value: Visibility; label: string }[] = [
  { value: "PRIVATE", label: "나만" },
  { value: "FOLLOWERS", label: "팔로워만" },
  { value: "PUBLIC", label: "전체 공개" },
];

export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "USER", label: "일반" },
  { value: "TRAINER", label: "트레이너" },
];

export function categoryLabel(category: Category): string {
  return CATEGORY_OPTIONS.find((item) => item.value === category)?.label ?? category;
}

export function exercisePartLabel(part: ExercisePart | null | undefined): string {
  if (!part) return "";
  return EXERCISE_PART_OPTIONS.find((item) => item.value === part)?.label ?? part;
}

export function cardioTypeLabel(type: CardioType | null | undefined): string {
  if (!type) return "";
  return CARDIO_TYPE_OPTIONS.find((item) => item.value === type)?.label ?? type;
}

export function visibilityLabel(visibility: Visibility): string {
  return VISIBILITY_OPTIONS.find((item) => item.value === visibility)?.label ?? visibility;
}

export function roleLabel(role: Role): string {
  return ROLE_OPTIONS.find((item) => item.value === role)?.label ?? role;
}

export function categoryBadgeClass(category: Category): string {
  switch (category) {
    case "DIET":
      return "bg-lime-100 text-lime-800";
    case "EXERCISE":
      return "bg-sky-100 text-sky-800";
    case "CARDIO":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
