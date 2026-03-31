"use client";

import { format, subMonths } from "date-fns";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMonthLabel } from "@/lib/format";

type MonthSelectProps = {
  value: string;
  onChange: (value: string) => void;
};

function buildMonthOptions() {
  return Array.from({ length: 12 }, (_, index) => format(subMonths(new Date(), index), "yyyy-MM"));
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
