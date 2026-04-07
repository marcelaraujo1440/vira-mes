"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "register";

const pinFieldProps = {
  inputMode: "numeric" as const,
  maxLength: 6,
  pattern: "\\d{6}",
  placeholder: "000000"
};

export function LoginCard() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [loginName, setLoginName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPinVisible, setIsPinVisible] = useState(false);
  const [isConfirmPinVisible, setIsConfirmPinVisible] = useState(false);

  function normalizePin(value: string) {
    return value.replace(/\D/g, "").slice(0, 6);
  }

  function PinVisibilityButton({
    isVisible,
    onToggle
  }: {
    isVisible: boolean;
    onToggle: () => void;
  }) {
    const Icon = isVisible ? EyeOff : Eye;

    return (
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        aria-label={isVisible ? "Ocultar PIN" : "Mostrar PIN"}
      >
        <Icon className="h-4 w-4" />
      </button>
    );
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
        body: JSON.stringify({ name, pin, confirmPin })
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

    if (!loginName.trim()) {
      toast.error("Digite seu nome de usuario.");
      return;
    }

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
        body: JSON.stringify({ name: loginName, pin })
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
      <div className="w-full max-w-5xl">
        <div className="grid items-stretch gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="glass-cream hidden overflow-hidden lg:flex lg:flex-col lg:justify-between">
            <CardHeader className="gap-5 pb-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Acesso privado
              </div>
              <div className="space-y-3">
                <CardTitle className="ink-title text-5xl leading-tight">
                  Fechamento pessoal com entrada rápida e cara de produto premium.
                </CardTitle>
                <CardDescription className="max-w-md text-base leading-7 text-muted-foreground">
                  Entre com seu PIN, acompanhe o mês sem distrações e mantenha seus lançamentos separados por usuário.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 pt-0">
              <div className="paper-panel rounded-[1.6rem] border border-border/70 p-5">
                <p className="section-kicker">O que voce encontra</p>
                <div className="mt-3 grid gap-3 text-sm leading-6 text-muted-foreground">
                  <p>Resumo do mês com entradas, saídas e saldo em destaque.</p>
                  <p>Gráficos com leitura rápida para categorias e evolução recente.</p>
                  <p>Proteção com PIN e isolamento dos dados por usuário.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-cream w-full overflow-hidden">
            <CardHeader className="gap-5 border-b border-border/70 bg-primary text-primary-foreground">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs uppercase tracking-[0.28em]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Area Protegida
              </div>
              <div className="space-y-2">
                <CardTitle className="text-4xl">PIN de acesso</CardTitle>
                <CardDescription className="text-primary-foreground/75">
                  Cadastre seu nome com um PIN de 6 digitos e depois entre com nome de usuario e PIN.
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
                <form className="auth-panel-enter auth-glow grid gap-4 rounded-[1.6rem] border border-border/70 p-5" onSubmit={handleRegister}>
                  <div className="mb-1">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Novo acesso</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Crie um novo usuário com nome e PIN único para acessar o painel.
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
                    <div className="relative">
                      <Input
                        id="register-pin"
                        type={isPinVisible ? "text" : "password"}
                        autoComplete="new-password"
                        className="pr-10"
                        {...pinFieldProps}
                        value={pin}
                        onChange={(event) => setPin(normalizePin(event.target.value))}
                      />
                      <PinVisibilityButton
                        isVisible={isPinVisible}
                        onToggle={() => setIsPinVisible((current) => !current)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="register-confirm-pin">Confirmar PIN</Label>
                    <div className="relative">
                      <Input
                        id="register-confirm-pin"
                        type={isConfirmPinVisible ? "text" : "password"}
                        autoComplete="new-password"
                        className="pr-10"
                        {...pinFieldProps}
                        value={confirmPin}
                        onChange={(event) => setConfirmPin(normalizePin(event.target.value))}
                      />
                      <PinVisibilityButton
                        isVisible={isConfirmPinVisible}
                        onToggle={() => setIsConfirmPinVisible((current) => !current)}
                      />
                    </div>
                  </div>
                  <Button disabled={isSubmitting} type="submit">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                    Criar cadastro
                  </Button>
                </form>
              ) : (
                <form className="auth-panel-enter auth-glow grid gap-4 rounded-[1.6rem] border border-border/70 p-5" onSubmit={handleLogin}>
                  <div className="mb-1">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Acesso recorrente</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Digite seu nome de usuario e o PIN de 6 digitos para entrar no sistema.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="login-name">Nome de usuario</Label>
                    <Input
                      id="login-name"
                      autoComplete="username"
                      placeholder="Seu nome"
                      value={loginName}
                      onChange={(event) => setLoginName(event.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="login-pin">PIN</Label>
                    <div className="relative">
                      <Input
                        id="login-pin"
                        type={isPinVisible ? "text" : "password"}
                        autoComplete="current-password"
                        className="pr-10"
                        {...pinFieldProps}
                        value={pin}
                        onChange={(event) => setPin(normalizePin(event.target.value))}
                      />
                      <PinVisibilityButton
                        isVisible={isPinVisible}
                        onToggle={() => setIsPinVisible((current) => !current)}
                      />
                    </div>
                  </div>
                  <Button disabled={isSubmitting} type="submit">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                    Entrar no painel
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
