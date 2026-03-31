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

  return (
    <Card>
      <CardContent className="flex items-start justify-between p-6">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-3xl text-foreground">
            {formatCurrency(value)}
          </p>
        </div>
        <div className="rounded-full border border-border/70 bg-background/70 p-3">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
