import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { requestPasswordRecovery, updatePassword } from "@/lib/auth";

export default function RecoverPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) setHasRecoverySession(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && (event === "PASSWORD_RECOVERY" || session)) {
        setHasRecoverySession(true);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await requestPasswordRecovery(email.trim());
      setMessage("Se o endereço estiver cadastrado, você receberá um e-mail com o link para redefinir sua senha. Verifique também a caixa de spam.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível solicitar a recuperação.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      setMessage("Senha atualizada com sucesso. Você já pode acessar o painel.");
      setPassword("");
      setConfirmPassword("");
      window.setTimeout(() => window.location.replace("/"), 1200);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível atualizar a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <section className="cad-card w-full max-w-lg border-2 border-accent/30 p-8">
        <div className="mb-6 h-3 w-3 animate-pulse bg-accent" />
        <p className="text-xs font-black uppercase tracking-[0.25em] text-accent">SofiaControlPanel</p>
        <h1 className="mt-3 text-2xl font-black uppercase tracking-tight">
          {hasRecoverySession ? "Criar nova senha" : "Recuperar senha"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {hasRecoverySession
            ? "Defina uma nova senha para sua conta."
            : "Informe o e-mail utilizado no cadastro. Enviaremos um link seguro para redefinir sua senha."}
        </p>

        {hasRecoverySession ? (
          <form onSubmit={handleUpdate} className="mt-7 space-y-4">
            <label className="block text-xs font-black uppercase tracking-widest">
              Nova senha
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
                className="mt-2 h-12 w-full border-2 border-foreground/20 bg-background px-3 text-sm outline-none focus:border-accent"
              />
            </label>
            <label className="block text-xs font-black uppercase tracking-widest">
              Confirmar nova senha
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
                className="mt-2 h-12 w-full border-2 border-foreground/20 bg-background px-3 text-sm outline-none focus:border-accent"
              />
            </label>
            <button type="submit" disabled={loading} className="h-12 w-full border-2 border-accent bg-accent px-5 text-sm font-black uppercase tracking-widest text-accent-foreground disabled:opacity-60">
              {loading ? "Salvando…" : "Atualizar senha"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequest} className="mt-7 space-y-4">
            <label className="block text-xs font-black uppercase tracking-widest">
              E-mail cadastrado
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="mt-2 h-12 w-full border-2 border-foreground/20 bg-background px-3 text-sm outline-none focus:border-accent"
              />
            </label>
            <button type="submit" disabled={loading} className="h-12 w-full border-2 border-accent bg-accent px-5 text-sm font-black uppercase tracking-widest text-accent-foreground disabled:opacity-60">
              {loading ? "Enviando…" : "Enviar link de recuperação"}
            </button>
          </form>
        )}

        {error && <p role="alert" className="mt-5 text-sm text-red-500">{error}</p>}
        {message && <p role="status" className="mt-5 text-sm text-accent">{message}</p>}
        <div className="mt-7 border-t border-foreground/15 pt-5">
          <Link href="/" className="text-sm font-semibold text-accent underline underline-offset-4">
            Voltar para o login
          </Link>
        </div>
      </section>
    </main>
  );
}
