"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { expenseCategories } from "@/lib/constants";
import { getCurrentMonth, getMonthFromDate, getTodayDate } from "@/lib/date";
import { expenseInputSchema } from "@/lib/validation";

type ExpenseFormValues = z.input<typeof expenseInputSchema>;

type ExpenseFormProps = {
  onSuccess: () => Promise<void>;
  submitLabel?: string;
};

export function ExpenseForm({ onSuccess, submitLabel = "Salvar saída" }: ExpenseFormProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseInputSchema),
    defaultValues: {
      date: getTodayDate(),
      category: "Alimentacao",
      description: "",
      amount: undefined,
      month: getCurrentMonth()
    }
  });

  const date = form.watch("date");

  useEffect(() => {
    if (!date) {
      return;
    }

    form.setValue("month", getMonthFromDate(date), { shouldValidate: true });
  }, [date, form]);

  async function onSubmit(values: ExpenseFormValues) {
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const error = (await response.json()) as { message?: string };
        throw new Error(error.message ?? "Nao foi possivel salvar a saida.");
      }

      form.reset({
        date: getTodayDate(),
        category: "Alimentacao",
        description: "",
        amount: undefined,
        month: getCurrentMonth()
      });
      await onSuccess();
      toast.success("Saida registrada com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar a saida.");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <Label htmlFor="expense-date">Data</Label>
        <Input id="expense-date" type="date" {...form.register("date")} />
        <p className="text-xs text-destructive">{form.formState.errors.date?.message}</p>
      </div>
      <div className="grid gap-2">
        <Label>Categoria</Label>
        <Select
          value={form.watch("category")}
          onValueChange={(value) =>
            form.setValue("category", value as ExpenseFormValues["category"], { shouldValidate: true })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {expenseCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-destructive">{form.formState.errors.category?.message}</p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="expense-description">Descricao</Label>
        <Input id="expense-description" placeholder="Opcional" {...form.register("description")} />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="expense-amount">Valor</Label>
          <Input
            id="expense-amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0,00"
            {...form.register("amount", { valueAsNumber: true })}
          />
          <p className="text-xs text-destructive">{form.formState.errors.amount?.message}</p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="expense-month">Mes</Label>
          <Input
            id="expense-month"
            inputMode="numeric"
            placeholder="2026-03"
            {...form.register("month")}
          />
          <p className="text-xs text-muted-foreground">Formato AAAA-MM. Preenchido pela data, mas pode ser editado.</p>
        </div>
      </div>
      <Button disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitLabel}
      </Button>
    </form>
  );
}
