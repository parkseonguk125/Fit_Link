import type { ExercisePart } from "@/generated/prisma/client";

export type ExerciseDefinition = {
  key: string;
  label: string;
  part: ExercisePart;
};

export const EXERCISE_CATALOG: ExerciseDefinition[] = [
  // 가슴
  { key: "BENCH_PRESS", label: "벤치 프레스", part: "CHEST" },
  { key: "INCLINE_BENCH_PRESS", label: "인클라인 벤치 프레스", part: "CHEST" },
  { key: "DECLINE_BENCH_PRESS", label: "디클라인 벤치 프레스", part: "CHEST" },
  { key: "DUMBBELL_BENCH_PRESS", label: "덤벨 벤치 프레스", part: "CHEST" },
  { key: "CHEST_PRESS", label: "체스트 프레스", part: "CHEST" },
  { key: "PEC_DECK", label: "펙 덱 플라이", part: "CHEST" },
  { key: "CABLE_FLY", label: "케이블 플라이", part: "CHEST" },
  { key: "DUMBBELL_FLY", label: "덤벨 플라이", part: "CHEST" },
  { key: "PUSH_UP", label: "푸시업", part: "CHEST" },
  { key: "DIPS", label: "딥스", part: "CHEST" },
  // 어깨
  { key: "OVERHEAD_PRESS", label: "오버헤드 프레스", part: "SHOULDER" },
  { key: "SHOULDER_PRESS", label: "숄더 프레스", part: "SHOULDER" },
  { key: "DUMBBELL_SHOULDER_PRESS", label: "덤벨 숄더 프레스", part: "SHOULDER" },
  { key: "LATERAL_RAISE", label: "사이드 레터럴 레이즈", part: "SHOULDER" },
  { key: "FRONT_RAISE", label: "프론트 레이즈", part: "SHOULDER" },
  { key: "REAR_DELT_FLY", label: "리어 델트 플라이", part: "SHOULDER" },
  { key: "UPRIGHT_ROW", label: "업라이트 로우", part: "SHOULDER" },
  { key: "ARNOLD_PRESS", label: "아놀드 프레스", part: "SHOULDER" },
  // 등
  { key: "DEADLIFT", label: "데드리프트", part: "BACK" },
  { key: "BARBELL_ROW", label: "바벨 로우", part: "BACK" },
  { key: "DUMBBELL_ROW", label: "덤벨 로우", part: "BACK" },
  { key: "LAT_PULLDOWN", label: "랫 풀다운", part: "BACK" },
  { key: "PULL_UP", label: "풀업", part: "BACK" },
  { key: "CABLE_ROW", label: "케이블 로우", part: "BACK" },
  { key: "T_BAR_ROW", label: "T바 로우", part: "BACK" },
  { key: "SEATED_ROW", label: "시티드 로우", part: "BACK" },
  { key: "HYPEREXTENSION", label: "하이퍼 익스텐션", part: "BACK" },
  // 하체
  { key: "SQUAT", label: "스쿼트", part: "LEGS" },
  { key: "LEG_PRESS", label: "레그 프레스", part: "LEGS" },
  { key: "LUNGE", label: "런지", part: "LEGS" },
  { key: "LEG_EXTENSION", label: "레그 익스텐션", part: "LEGS" },
  { key: "LEG_CURL", label: "레그 컬", part: "LEGS" },
  { key: "ROMANIAN_DEADLIFT", label: "루마니안 데드리프트", part: "LEGS" },
  { key: "CALF_RAISE", label: "카프 레이즈", part: "LEGS" },
  { key: "HACK_SQUAT", label: "핵 스쿼트", part: "LEGS" },
  { key: "BULGARIAN_SPLIT_SQUAT", label: "불가리안 스플릿 스쿼트", part: "LEGS" },
  // 팔
  { key: "BARBELL_CURL", label: "바벨 컬", part: "ARMS" },
  { key: "DUMBBELL_CURL", label: "덤벨 컬", part: "ARMS" },
  { key: "HAMMER_CURL", label: "해머 컬", part: "ARMS" },
  { key: "TRICEPS_PUSHDOWN", label: "트라이셉스 푸시다운", part: "ARMS" },
  { key: "SKULL_CRUSHER", label: "스컬 크러셔", part: "ARMS" },
  { key: "TRICEPS_EXTENSION", label: "트라이셉스 익스텐션", part: "ARMS" },
  { key: "PREACHER_CURL", label: "프리처 컬", part: "ARMS" },
  { key: "CONCENTRATION_CURL", label: "컨센트레이션 컬", part: "ARMS" },
  // 코어
  { key: "PLANK", label: "플랭크", part: "CORE" },
  { key: "CRUNCH", label: "크런치", part: "CORE" },
  { key: "LEG_RAISE", label: "레그 레이즈", part: "CORE" },
  { key: "SIT_UP", label: "싯업", part: "CORE" },
  { key: "RUSSIAN_TWIST", label: "러시안 트위스트", part: "CORE" },
  { key: "CABLE_CRUNCH", label: "케이블 크런치", part: "CORE" },
  { key: "ABDOMINAL_MACHINE", label: "복근 머신", part: "CORE" },
  // 기타
  { key: "OTHER", label: "기타", part: "OTHER" },
];

export function getExercisesByPart(part: ExercisePart): ExerciseDefinition[] {
  return EXERCISE_CATALOG.filter((item) => item.part === part);
}

export function getExerciseLabel(key: string): string {
  return EXERCISE_CATALOG.find((item) => item.key === key)?.label ?? key;
}

export type PreviousExerciseSet = {
  setNumber: number;
  weightKg: number;
  reps: number;
};

export function isSetImproved(
  weightKg: number,
  reps: number,
  previous: PreviousExerciseSet | undefined,
): boolean {
  if (!previous) return false;
  return weightKg * reps >= previous.weightKg * previous.reps;
}

export function formatPreviousSet(previous: PreviousExerciseSet): string {
  return `이전: ${formatWeight(previous.weightKg)}kg ${previous.reps}회`;
}

function formatWeight(weight: number): string {
  return Number.isInteger(weight) ? String(weight) : weight.toFixed(1);
}
