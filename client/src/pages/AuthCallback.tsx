import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("Concluindo autenticação…");

  useEffect(() => {
    let active = true;

    async function completeOAuth() {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error_description") || params.get("error");
      const code = params.get("code");

      if (error) {
        if (active) setMessage(`Não foi possível concluir o login: ${error}`);
        return;
      }

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (active)
            setMessage(
              `Não foi possível concluir o login: ${exchangeError.message}`
            );
          return;
        }
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) {
        if (active) {
          setMessage(
            sessionError?.message ||
              "A autenticação não retornou uma sessão válida."
          );
        }
        return;
      }

      setLocation("/");
    }

    completeOAuth().catch(callbackError => {
      if (active) {
        setMessage(
          callbackError instanceof Error
            ? callbackError.message
            : "Erro inesperado ao concluir o login."
        );
      }
    });

    return () => {
      active = false;
    };
  }, [setLocation]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="cad-card w-full max-w-lg border-2 border-accent/30 p-8 text-center">
        <div className="mx-auto mb-6 h-3 w-3 animate-pulse bg-accent" />
        <h1 className="text-2xl font-black uppercase tracking-tight">
          SofiaControlPanel
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {message}
        </p>
        {message !== "Concluindo autenticação…" && (
          <a
            className="mt-6 inline-block text-sm font-bold text-accent underline"
            href="/"
          >
            Voltar para a página inicial
          </a>
        )}
      </section>
    </main>
  );
}
