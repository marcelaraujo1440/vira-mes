"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatMonthLabel } from "@/lib/format";
import type { Transaction } from "@/lib/types";

type TransactionsTableProps = {
  items: Transaction[];
  onDelete: (transaction: Transaction) => Promise<void>;
};

export function TransactionsTable({ items, onDelete }: TransactionsTableProps) {
  async function handleDelete(transaction: Transaction) {
    const endpoint = transaction.type === "expense" ? "/api/expenses" : "/api/income";

    try {
      const response = await fetch(`${endpoint}?id=${transaction.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const error = (await response.json()) as { message?: string };
        throw new Error(error.message ?? "Nao foi possivel remover o lancamento.");
      }

      await onDelete(transaction);
      toast.success("Lancamento excluido.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir o lancamento.");
    }
  }

  if (items.length === 0) {
    return (
      <div className="soft-grid rounded-[1.5rem] border border-dashed border-border/70 bg-background/60 p-8 text-center">
        <p className="font-[family-name:var(--font-display)] text-2xl text-foreground">Seu mes ainda esta em branco.</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Registre uma entrada ou saída para começar a montar o fechamento deste período.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Descricao</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="text-right">Acoes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((transaction) => (
          <TableRow className="hover:bg-background/70" key={transaction.id}>
            <TableCell className="font-medium">
              <span
                className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.22em] ${
                  transaction.type === "expense"
                    ? "bg-amber-200/60 text-amber-950"
                    : "bg-emerald-200/60 text-emerald-950"
                }`}
              >
                {transaction.type === "expense" ? "Saida" : "Entrada"}
              </span>
            </TableCell>
            <TableCell>{transaction.type === "expense" ? transaction.date : formatMonthLabel(transaction.month)}</TableCell>
            <TableCell>{transaction.type === "expense" ? transaction.category : "Receita"}</TableCell>
            <TableCell>{transaction.description || "Sem descricao"}</TableCell>
            <TableCell className="text-right font-semibold">{formatCurrency(transaction.amount)}</TableCell>
            <TableCell className="text-right">
              <Button
                className="text-muted-foreground transition-colors hover:text-destructive"
                size="icon"
                type="button"
                variant="ghost"
                onClick={() => handleDelete(transaction)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
