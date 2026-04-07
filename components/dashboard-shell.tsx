"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, useTransition } from "react";
import { ArrowDownLeft, ArrowUpCircle, ArrowUpRight, Landmark, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { ExpenseForm } from "@/components/expense-form";
import { IncomeForm } from "@/components/income-form";
import { LoadingDashboard } from "@/components/loading-dashboard";
import { LogoutButton } from "@/components/logout-button";
import { MonthSelect } from "@/components/month-select";
import { SummaryCard } from "@/components/summary-card";
import { TransactionsTable } from "@/components/transactions-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { getCurrentMonth } from "@/lib/date";
import { formatMonthLabel } from "@/lib/format";
import type { Summary, Transaction } from "@/lib/types";

const ChartsPanel = dynamic(
  () => import("@/components/charts-panel").then((module) => module.ChartsPanel),
  {
    ssr: false,
    loading: () => <div className="h-[44rem] animate-pulse rounded-[1.75rem] bg-secondary/60" />
  }
);

type DashboardShellProps = {
  initialMonth?: string;
  initialSummary?: Summary | null;
  userName?: string;
};

export function DashboardShell({
  initialMonth = getCurrentMonth(),
  initialSummary = null,
  userName = ""
}: DashboardShellProps) {
  const [month, setMonth] = useState(initialMonth);
  const [summary, setSummary] = useState<Summary | null>(initialSummary);
  const [isLoading, setIsLoading] = useState(initialSummary ? false : true);
  const [isPending, startTransition] = useTransition();
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);

  const loadSummary = useCallback(async (nextMonth: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/summary?month=${nextMonth}`, {
        cache: "no-store",
        credentials: "include"
      });

      if (!response.ok) {
        const error = (await response.json()) as { message?: string };
        throw new Error(error.message ?? "Nao foi possivel carregar o painel.");
      }

      const payload = (await response.json()) as Summary;
      setSummary(payload);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar o painel.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (month === initialMonth && initialSummary) {
      return;
    }

    void loadSummary(month);
  }, [initialMonth, initialSummary, loadSummary, month]);

  async function refreshSummary() {
    await loadSummary(month);
  }

  async function handleExpenseSaved() {
    await refreshSummary();
    setIsExpenseDialogOpen(false);
  }

  async function handleIncomeSaved() {
    await refreshSummary();
    setIsIncomeDialogOpen(false);
  }

  function handleMonthChange(value: string) {
    startTransition(() => {
      setMonth(value);
    });
  }

  async function handleDelete(_transaction: Transaction) {
    await refreshSummary();
  }

  if (isLoading && !summary) {
    return <LoadingDashboard />;
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <section className="mb-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="glass-cream overflow-hidden">
          <CardHeader className="relative gap-5 pb-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3 py-1 text-xs uppercase tracking-[0.28em] text-muted-foreground">
              <Landmark className="h-3.5 w-3.5" />
              Vira Mes
            </div>
            <div className="space-y-3">
              {userName ? (
                <p className="section-kicker">Ola, {userName}</p>
              ) : null}
              <CardTitle className="ink-title max-w-2xl text-4xl sm:text-5xl">
                Seu caixa mensal, em um painel que parece caderno de fechamento.
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-7 text-muted-foreground">
                Lance entradas e saídas, acompanhe o saldo do mês e enxergue rapidamente onde o dinheiro se espalhou.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 border-t border-border/70 bg-primary px-6 py-5 text-primary-foreground sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-primary-foreground/70">Mes em foco</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-2xl">{formatMonthLabel(month)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-primary-foreground/70">Visao</p>
              <p className="mt-2 text-sm leading-6">Resumo, composicao por categoria e historico recente.</p>
            </div>
            <div className="flex items-end justify-start sm:justify-end">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm">
                <ArrowUpRight className="h-4 w-4" />
                Fechamento pessoal simplificado
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4">
          <Card className="glass-cream">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Filtrar periodo</CardTitle>
              <CardDescription>Todos os graficos e listas acompanham esta selecao.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <MonthSelect value={month} onChange={handleMonthChange} />
              <Button disabled={isLoading || isPending} onClick={() => void refreshSummary()} variant="outline">
                <RefreshCcw className={`h-4 w-4 ${isLoading || isPending ? "animate-spin" : ""}`} />
                Atualizar painel
              </Button>
              <LogoutButton />
            </CardContent>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
              <Card className="glass-cream overflow-hidden">
                <CardContent className="flex h-full flex-col justify-between gap-5 p-6">
                  <div className="space-y-3">
                    <div className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-200/60 px-3 py-1 text-xs uppercase tracking-[0.24em] text-amber-950">
                      Saida
                    </div>
                    <div>
                      <h3 className="font-[family-name:var(--font-display)] text-3xl">Registrar saída</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Lance um gasto em poucos toques e volte direto para o painel.
                      </p>
                    </div>
                  </div>
                  <DialogTrigger asChild>
                    <Button className="w-full justify-between" size="lg">
                      Abrir formulário
                      <ArrowDownLeft className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                </CardContent>
              </Card>
              <DialogContent className="glass-cream">
                <DialogHeader className="mb-5">
                  <DialogTitle>Nova saída</DialogTitle>
                  <DialogDescription>
                    Registre despesas do mês com data, categoria e valor.
                  </DialogDescription>
                </DialogHeader>
                <ExpenseForm onSuccess={handleExpenseSaved} submitLabel="Salvar saída" />
              </DialogContent>
            </Dialog>

            <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
              <Card className="glass-cream overflow-hidden">
                <CardContent className="flex h-full flex-col justify-between gap-5 p-6">
                  <div className="space-y-3">
                    <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-200/60 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-950">
                      Entrada
                    </div>
                    <div>
                      <h3 className="font-[family-name:var(--font-display)] text-3xl">Registrar entrada</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Adicione receitas sem poluir a tela principal do seu fechamento.
                      </p>
                    </div>
                  </div>
                  <DialogTrigger asChild>
                    <Button className="w-full justify-between" size="lg" variant="secondary">
                      Abrir formulário
                      <ArrowUpCircle className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                </CardContent>
              </Card>
              <DialogContent className="glass-cream">
                <DialogHeader className="mb-5">
                  <DialogTitle>Nova entrada</DialogTitle>
                  <DialogDescription>
                    Registre salário, extra ou qualquer receita do período selecionado.
                  </DialogDescription>
                </DialogHeader>
                <IncomeForm onSuccess={handleIncomeSaved} submitLabel="Salvar entrada" />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <div className={isLoading || isPending ? "opacity-80 transition-opacity" : "transition-opacity"}>
        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Entradas" value={summary?.totalIncome ?? 0} tone="income" />
          <SummaryCard label="Saidas" value={summary?.totalExpenses ?? 0} tone="expense" />
          <SummaryCard label="Saldo" value={summary?.balance ?? 0} tone="balance" />
        </section>

        <section className="mt-4">
          <ChartsPanel byCategory={summary?.byCategory ?? []} monthlyBalance={summary?.monthlyBalance ?? []} />
        </section>

        <section className="mt-4">
          <Card className="glass-cream overflow-hidden">
            <CardHeader>
              <p className="section-kicker">Livro de movimentos</p>
              <CardTitle className="text-2xl">Lancamentos do mes</CardTitle>
              <CardDescription>
                Entradas e saídas reunidas na mesma mesa para facilitar o fechamento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionsTable items={summary?.transactions ?? []} onDelete={handleDelete} />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
