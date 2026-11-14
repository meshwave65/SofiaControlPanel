import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { startGoogleLogin } from "@/lib/auth";

export default function AuthCallback() {
  const [message, setMessage] = useState("Concluindo autenticação…");
  const [hasError, setHasError] = useState(false);

  const retryLogin = async () => {
    setHasError(false);
    setMessage("Abrindo a seleção de conta…");
    await supabase.auth.signOut().catch(() => undefined);
    try {
      await startGoogleLogin();
    } catch (error) {
      setHasError(true);
      setMessage(error instanceof Error ? `Não foi possível iniciar o login: ${error.message}` : "Não foi possível iniciar o login.");
    }
  };

  useEffect(() => {
    let active = true;

    async function completeOAuth() {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error_description") || params.get("error");
      const code = params.get("code");

      if (error) {
        if (active) {
          setHasError(true);
          setMessage(`Não foi possível concluir o login: ${error}. Tente novamente ou use outra conta.`);
        }
        return;
      }

      let session: Session | null = null;

      if (code) {
        const { data, error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (active) {
            setHasError(true);
            setMessage(
              `Não foi possível concluir o login: ${exchangeError.message}`
            );
          }
          return;
        }
        session = data.session;
      } else {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          if (active) {
            setHasError(true);
            setMessage(
              `Não foi possível concluir o login: ${sessionError.message}`
            );
          }
          return;
        }
        session = data.session;
      }

      if (!session) {
        if (active) {
          setHasError(true);
          setMessage(
            "A autenticação não retornou uma sessão válida. Inicie o login novamente."
          );
        }
        return;
      }

      window.location.replace("/");
    }

    completeOAuth().catch(callbackError => {
      if (active) {
        setHasError(true);
        setMessage(
          callbackError instanceof Error
            ? `Não foi possível concluir o login: ${callbackError.message}`
            : "Erro inesperado ao concluir o login."
        );
      }
    });

    return () => {
      active = false;
    };
  }, []);

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
        {hasError && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="border-2 border-accent bg-accent px-5 py-3 text-sm font-black uppercase tracking-wider text-accent-foreground"
              onClick={() => void retryLogin()}
            >
              Tentar novamente / usar outra conta
            </button>
            <a className="border border-foreground/20 px-5 py-3 text-sm font-bold text-accent underline" href="/">
              Voltar para a página inicial
            </a>
          </div>
        )}
      </section>
    </main>
  );
}
