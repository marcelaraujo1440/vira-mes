import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

const iconMap = {
  income: ArrowUpRight,
  expense: ArrowDownLeft,
  balance: Wallet
} as const;

type SummaryCardProps = {
  label: string;
  value: number;
  tone: keyof typeof iconMap;
};

export function SummaryCard({ label, value, tone }: SummaryCardProps) {
  const Icon = iconMap[tone];
  const toneClasses = {
    income: "bg-emerald-200/55 text-emerald-950",
    expense: "bg-amber-200/55 text-amber-950",
    balance: "bg-stone-200/65 text-stone-900"
  }[tone];

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start justify-between p-6">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-3xl text-foreground">
            {formatCurrency(value)}
          </p>
        </div>
        <div className={`rounded-full border border-border/60 p-3 ${toneClasses}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
