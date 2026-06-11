import { Lunar, Solar } from "lunar-javascript";

export type CalendarParts = {
  year: number;
  month: number;
  day: number;
};

export const CALENDAR_YEAR_MIN = 2020;
export const CALENDAR_YEAR_MAX = 2036;

export function solarPartsFromDate(date: Date): CalendarParts {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

export function lunarPartsFromDate(date: Date): CalendarParts {
  const solar = Solar.fromYmd(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
  const lunar = solar.getLunar();
  return {
    year: lunar.getYear(),
    month: lunar.getMonth(),
    day: lunar.getDay(),
  };
}

export function clampSolarDay(year: number, month: number, day: number) {
  const maxDay = new Date(year, month, 0).getDate();
  return Math.min(Math.max(day, 1), maxDay);
}

export function getLunarDaysInMonth(lunarYear: number, lunarMonth: number) {
  for (let candidate = 30; candidate >= 29; candidate -= 1) {
    try {
      Lunar.fromYmd(lunarYear, lunarMonth, candidate);
      return candidate;
    } catch {
      // try shorter month
    }
  }
  return 29;
}

export function clampLunarDay(lunarYear: number, lunarMonth: number, day: number) {
  const maxDay = getLunarDaysInMonth(lunarYear, lunarMonth);
  return Math.min(Math.max(day, 1), maxDay);
}

export function dateFromSolarParts(parts: CalendarParts) {
  return new Date(
    parts.year,
    parts.month - 1,
    clampSolarDay(parts.year, parts.month, parts.day),
  );
}

export function dateFromLunarParts(parts: CalendarParts) {
  const solar = Lunar.fromYmd(
    parts.year,
    parts.month,
    clampLunarDay(parts.year, parts.month, parts.day),
  ).getSolar();

  return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
}

export function partsFromDate(date: Date, calendarType: "solar" | "lunar") {
  return calendarType === "solar"
    ? solarPartsFromDate(date)
    : lunarPartsFromDate(date);
}

export function dateFromParts(
  parts: CalendarParts,
  calendarType: "solar" | "lunar",
) {
  return calendarType === "solar"
    ? dateFromSolarParts(parts)
    : dateFromLunarParts(parts);
}
