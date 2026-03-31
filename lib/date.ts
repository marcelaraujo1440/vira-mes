import { format, parseISO, subMonths } from "date-fns";

export function getMonthFromDate(date: string) {
  return format(parseISO(date), "yyyy-MM");
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
