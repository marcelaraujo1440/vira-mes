"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMonthLabel } from "@/lib/format";

type MonthSelectProps = {
  value: string;
  onChange: (value: string) => void;
};

function buildMonthOptions() {
  return [
    "2026-03",
    "2026-04",
    "2026-05",
    "2026-06",
    "2026-07",
    "2026-08",
    "2026-09",
    "2026-10",
    "2026-11",
    "2026-12"
  ];
}

export function MonthSelect({ value, onChange }: MonthSelectProps) {
  const months = buildMonthOptions();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full md:w-[220px]">
        <SelectValue placeholder="Selecione o mes" />
      </SelectTrigger>
      <SelectContent>
        {months.map((month) => (
          <SelectItem key={month} value={month}>
            {formatMonthLabel(month)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
