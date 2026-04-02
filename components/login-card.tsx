"use client";

import { useState } from "react";
import { Loader2, LockKeyhole, ShieldCheck, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "register";

const pinInputProps = {
  inputMode: "numeric" as const,
  maxLength: 6,
  pattern: "\\d{6}",
  placeholder: "000000"
};

export function LoginCard() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function normalizePin(value: string) {
    return value.replace(/\D/g, "").slice(0, 6);
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Digite seu nome para cadastrar.");
      return;
    }

    if (pin.length !== 6) {
      toast.error("Use um PIN com 6 digitos.");
      return;
    }

    if (confirmPin !== pin) {
      toast.error("Os PINs precisam ser iguais.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          pin,
          confirmPin
        })
      });

      if (!response.ok) {
        const error = (await response.json()) as { message?: string };
        throw new Error(error.message ?? "Nao foi possivel concluir o cadastro.");
      }

      toast.success("Cadastro criado e acesso liberado.");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao cadastrar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pin.length !== 6) {
      toast.error("Digite seu PIN de 6 digitos.");
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

      toast.success("Acesso liberado.");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao entrar.");
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
            <CardTitle className="text-4xl">PIN de acesso</CardTitle>
            <CardDescription className="text-primary-foreground/75">
              Cadastre um nome com PIN de 6 digitos e depois entre digitando apenas o PIN.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative mb-6 grid grid-cols-2 rounded-full border border-border/70 bg-background/70 p-1">
            <div
              className={`absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-full bg-primary shadow-velvet transition-transform duration-300 ease-out ${
                mode === "login" ? "translate-x-0" : "translate-x-full"
              }`}
            />
            <Button
              type="button"
              className={`relative z-10 ${
                mode === "login"
                  ? "bg-transparent text-primary-foreground shadow-none hover:bg-transparent"
                  : "bg-transparent text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground"
              }`}
              variant="ghost"
              onClick={() => setMode("login")}
            >
              Entrar
            </Button>
            <Button
              type="button"
              className={`relative z-10 ${
                mode === "register"
                  ? "bg-transparent text-primary-foreground shadow-none hover:bg-transparent"
                  : "bg-transparent text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground"
              }`}
              variant="ghost"
              onClick={() => setMode("register")}
            >
              Cadastrar
            </Button>
          </div>

          {mode === "register" ? (
            <form
              className="auth-panel-enter auth-glow grid gap-4 rounded-[1.6rem] border border-border/70 p-5"
              key="register"
              onSubmit={handleRegister}
            >
              <div className="mb-1">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Cadastro rapido</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Defina quem usa o app e proteja o acesso com um PIN curto para o uso diario.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="register-name">Nome</Label>
                <Input
                  id="register-name"
                  autoComplete="name"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="register-pin">PIN</Label>
                <Input
                  id="register-pin"
                  type="password"
                  autoComplete="new-password"
                  {...pinInputProps}
                  value={pin}
                  onChange={(event) => setPin(normalizePin(event.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="register-confirm-pin">Confirmar PIN</Label>
                <Input
                  id="register-confirm-pin"
                  type="password"
                  autoComplete="new-password"
                  {...pinInputProps}
                  value={confirmPin}
                  onChange={(event) => setConfirmPin(normalizePin(event.target.value))}
                />
              </div>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Criar cadastro
              </Button>
            </form>
          ) : (
            <form
              className="auth-panel-enter auth-glow grid gap-4 rounded-[1.6rem] border border-border/70 p-5"
              key="login"
              onSubmit={handleLogin}
            >
              <div className="mb-1">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Acesso recorrente</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Entre no seu fechamento do mês digitando apenas o PIN de 6 digitos.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="login-pin">PIN</Label>
                <Input
                  id="login-pin"
                  type="password"
                  autoComplete="current-password"
                  {...pinInputProps}
                  value={pin}
                  onChange={(event) => setPin(normalizePin(event.target.value))}
                />
              </div>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                Entrar com PIN
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
