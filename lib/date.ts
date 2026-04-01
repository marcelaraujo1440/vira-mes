import { format, parseISO, subMonths } from "date-fns";

export function getMonthFromDate(date: string) {
  return format(parseISO(date), "yyyy-MM");
}

export function normalizeMonthValue(value: string | undefined) {
  if (!value) {
    return "";
  }

  const trimmedValue = value.trim();

  if (/^\d{4}-\d{2}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  const slashMatch = trimmedValue.match(/^(\d{4})[/-](\d{1,2})(?:[/-]\d{1,2})?$/);

  if (slashMatch) {
    const [, year, month] = slashMatch;
    return `${year}-${month.padStart(2, "0")}`;
  }

  const dateMatch = trimmedValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

  if (dateMatch) {
    const [, , month, year] = dateMatch;
    return `${year}-${month.padStart(2, "0")}`;
  }

  return "";
}

export function getTodayDate() {
  return format(new Date(), "yyyy-MM-dd");
}

export function getCurrentMonth() {
  return format(new Date(), "yyyy-MM");
}

export function getRecentMonths(total: number, anchor = new Date()) {
  return Array.from({ length: total }, (_, index) =>
    format(subMonths(anchor, total - index - 1), "yyyy-MM")
  );
}
