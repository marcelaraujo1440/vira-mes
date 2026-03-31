"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { ChartCard } from "@/components/chart-card";
import { formatCurrency, formatMonthLabel } from "@/lib/format";
import type { CategoryTotal, MonthlyBalancePoint } from "@/lib/types";

const chartColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "#b95c43", "#6f7f4f", "#9a7c49"];

type ChartsPanelProps = {
  byCategory: CategoryTotal[];
  monthlyBalance: MonthlyBalancePoint[];
};

export function ChartsPanel({ byCategory, monthlyBalance }: ChartsPanelProps) {
  const pieData = byCategory.filter((item) => item.total > 0);
  const hasCategoryData = pieData.length > 0;

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="grid gap-4 xl:col-span-2">
        <ChartCard
          title="Despesas por categoria"
          description="Comparativo do que mais pesou no mês selecionado."
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(110, 95, 76, 0.18)" vertical={false} />
                <XAxis dataKey="category" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickFormatter={(value) => `R$${value}`} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip formatter={(value: number) => formatCurrency(Number(value))} />
                <Bar dataKey="total" radius={[12, 12, 0, 0]} fill="hsl(var(--chart-1))" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard
          title="Evolucao do saldo"
          description="Seis meses para visualizar ganho de folego ou aperto."
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyBalance}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(110, 95, 76, 0.18)" vertical={false} />
                <XAxis dataKey="month" tickFormatter={formatMonthLabel} tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickFormatter={(value) => `R$${value}`} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip formatter={(value: number) => formatCurrency(Number(value))} labelFormatter={formatMonthLabel} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="hsl(var(--chart-3))" strokeWidth={3} dot={false} name="Entradas" isAnimationActive={false} />
                <Line type="monotone" dataKey="expenses" stroke="hsl(var(--chart-5))" strokeWidth={3} dot={false} name="Saidas" isAnimationActive={false} />
                <Line type="monotone" dataKey="balance" stroke="hsl(var(--chart-1))" strokeWidth={4} dot={false} name="Saldo" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
      <ChartCard title="Divisao percentual" description="Leitura rapida do peso de cada categoria.">
        <div className="h-80">
          {hasCategoryData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip formatter={(value: number) => formatCurrency(Number(value))} />
                <Pie
                  data={pieData}
                  dataKey="total"
                  nameKey="category"
                  innerRadius={66}
                  outerRadius={110}
                  paddingAngle={3}
                  isAnimationActive={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={entry.category} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-[1.5rem] border border-dashed border-border/70 bg-background/50 px-6 text-center text-sm text-muted-foreground">
              Ainda nao ha despesas no mes selecionado para montar a divisao percentual.
            </div>
          )}
        </div>
      </ChartCard>
    </div>
  );
}
