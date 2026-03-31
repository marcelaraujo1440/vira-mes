"use client";

import { useState } from "react";
import { Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginCard() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pin.trim()) {
      toast.error("Digite o PIN para entrar.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ pin })
      });

      if (!response.ok) {
        const error = (await response.json()) as { message?: string };
        throw new Error(error.message ?? "Nao foi possivel entrar.");
      }

      router.push("/");
      router.refresh();
      toast.success("Acesso liberado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao autenticar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md overflow-hidden">
        <CardHeader className="gap-5 border-b border-border/70 bg-primary text-primary-foreground">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs uppercase tracking-[0.28em]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Area Protegida
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl">Entrar</CardTitle>
            <CardDescription className="text-primary-foreground/75">
              Use seu PIN numerico para abrir o painel financeiro no celular ou no desktop.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={12}
                pattern="\d*"
                placeholder="Digite apenas numeros"
                type="password"
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
              />
            </div>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
