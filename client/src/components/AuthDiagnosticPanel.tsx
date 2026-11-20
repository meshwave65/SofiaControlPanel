import { useEffect, useState } from "react";
import { clearAuthDiagnosticReport, getAuthDiagnosticReport } from "@/lib/authDiagnostics";
const DEBUG_FLAG = "scp.authDiagnostics.enabled";
export default function AuthDiagnosticPanel() {
  const [expanded, setExpanded] = useState(false);
  const [enabled, setEnabled] = useState(() => {
    try {
      const requested = new URLSearchParams(window.location.search).get("authDebug") === "1";
      if (requested) window.sessionStorage.setItem(DEBUG_FLAG, "1");
      return requested || window.sessionStorage.getItem(DEBUG_FLAG) === "1";
    } catch { return new URLSearchParams(window.location.search).get("authDebug") === "1"; }
  });
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("authDebug") === "1") {
      try { window.sessionStorage.setItem(DEBUG_FLAG, "1"); setEnabled(true); } catch { /* Storage unavailable */ }
    }
  }, []);
  if (!enabled) return null;
  const exportReport = () => {
    const blob = new Blob([JSON.stringify(getAuthDiagnosticReport(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scp-auth-diagnostic-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const copyReport = async () => navigator.clipboard.writeText(JSON.stringify(getAuthDiagnosticReport(), null, 2));
  return <aside className="fixed bottom-3 right-3 z-[9999] max-w-[min(92vw,360px)] border-2 border-amber-500 bg-background p-3 text-foreground shadow-xl">
    <div className="flex items-center justify-between gap-3"><strong className="text-xs uppercase tracking-wide">Diagnóstico de autenticação</strong><button type="button" className="text-xs underline" onClick={() => setExpanded(value => !value)}>{expanded ? "Recolher" : "Abrir"}</button></div>
    {expanded && <div className="mt-3 flex flex-wrap gap-2 text-xs">
      <button type="button" className="border px-2 py-1" onClick={exportReport}>Exportar JSON</button>
      <button type="button" className="border px-2 py-1" onClick={() => void copyReport()}>Copiar relatório</button>
      <button type="button" className="border px-2 py-1" onClick={() => { clearAuthDiagnosticReport(); window.sessionStorage.removeItem(DEBUG_FLAG); window.location.replace("/"); }}>Encerrar diagnóstico</button>
      <p className="w-full text-muted-foreground">O relatório não inclui tokens, senhas ou e-mail. O modo de diagnóstico permanece ativo nesta aba até ser encerrado.</p>
    </div>}
  </aside>;
}
