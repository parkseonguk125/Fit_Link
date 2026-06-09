export function formatDate(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toDateInputValue(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toISOString().slice(0, 10);
}

export function getRecordMemo(record: {
  feltNote: string;
  hardNote: string;
  lackingNote: string;
  questionNote: string;
}) {
  return [record.feltNote, record.hardNote, record.lackingNote, record.questionNote]
    .map((note) => note.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function formatCardioDuration(
  hours: number | null | undefined,
  minutes: number | null | undefined,
): string | null {
  const h = hours ?? 0;
  const m = minutes ?? 0;
  if (h <= 0 && m <= 0) return null;

  const parts: string[] = [];
  if (h > 0) parts.push(`${h}시간`);
  if (m > 0) parts.push(`${m}분`);
  return parts.join(" ");
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
