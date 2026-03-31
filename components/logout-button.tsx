"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) {
        throw new Error("Nao foi possivel sair.");
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao sair.");
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleLogout}>
      <LogOut className="h-4 w-4" />
      Sair
    </Button>
  );
}
