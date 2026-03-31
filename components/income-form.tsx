"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentMonth } from "@/lib/date";
import { incomeInputSchema } from "@/lib/validation";

type IncomeFormValues = z.input<typeof incomeInputSchema>;

type IncomeFormProps = {
  onSuccess: () => Promise<void>;
};

export function IncomeForm({ onSuccess }: IncomeFormProps) {
  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeInputSchema),
    defaultValues: {
      month: getCurrentMonth(),
      description: "",
      amount: undefined
    }
  });

  async function onSubmit(values: IncomeFormValues) {
    try {
      const response = await fetch("/api/income", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const error = (await response.json()) as { message?: string };
        throw new Error(error.message ?? "Nao foi possivel salvar a entrada.");
      }

      form.reset({
        month: getCurrentMonth(),
        description: "",
        amount: undefined
      });
      await onSuccess();
      toast.success("Entrada registrada com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar a entrada.");
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl">Registrar entrada</CardTitle>
        <CardDescription>Adicione receitas mensais, salários ou extras.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="income-month">Mes</Label>
            <Input id="income-month" type="month" {...form.register("month")} />
            <p className="text-xs text-destructive">{form.formState.errors.month?.message}</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="income-amount">Valor</Label>
            <Input
              id="income-amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0,00"
              {...form.register("amount", { valueAsNumber: true })}
            />
            <p className="text-xs text-destructive">{form.formState.errors.amount?.message}</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="income-description">Descricao</Label>
            <Input id="income-description" placeholder="Opcional" {...form.register("description")} />
          </div>
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Salvar entrada
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
