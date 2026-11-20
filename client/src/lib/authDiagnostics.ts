const STORAGE_KEY = "scp.authDiagnostics.events";
const CORRELATION_KEY = "scp.authDiagnostics.correlationId";
const MAX_EVENTS = 150;
const DEBUG_FLAG = "scp.authDiagnostics.enabled";

export function isAuthDiagnosticEnabled() {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("authDebug") === "1" || window.sessionStorage.getItem(DEBUG_FLAG) === "1";
  } catch {
    return new URLSearchParams(window.location.search).get("authDebug") === "1";
  }
}

export type AuthDiagnosticEvent = {
  timestamp: string;
  event: string;
  correlationId: string;
  details?: Record<string, unknown>;
};

function safeDetails(details?: Record<string, unknown>) {
  if (!details) return undefined;
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(details)) {
    if (/^(accessToken|refreshToken|password|secret|authorization|cookie|email|name|profile|session)$/i.test(key)) {
      output[key] = "[redacted]";
    } else if (value instanceof Error) {
      output[key] = { name: value.name };
    } else if (typeof value === "string") {
      output[key] = value
        .replace(/Bearer\s+[^\s]+/gi, "Bearer [redacted]")
        .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
        .slice(0, 300);
    } else if (typeof value === "number" || typeof value === "boolean" || value === null) {
      output[key] = value;
    } else {
      output[key] = String(value).slice(0, 120);
    }
  }
  return output;
}

function getCorrelationId() {
  try {
    let id = window.sessionStorage.getItem(CORRELATION_KEY);
    if (!id) {
      id = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `scp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      window.sessionStorage.setItem(CORRELATION_KEY, id);
    }
    return id;
  } catch {
    return "scp-correlation-unavailable";
  }
}

export function recordAuthDiagnostic(event: string, details?: Record<string, unknown>) {
  if (typeof window === "undefined" || !isAuthDiagnosticEnabled()) return;
  try {
    const entry: AuthDiagnosticEvent = {
      timestamp: new Date().toISOString(),
      event,
      correlationId: getCorrelationId(),
      details: safeDetails(details),
    };
    const previous = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    const events = Array.isArray(previous) ? previous : [];
    events.push(entry);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    // Diagnostics must never interrupt authentication.
  }
}

export function getAuthDiagnosticReport() {
  try {
    const events = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return {
      generatedAt: new Date().toISOString(),
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      events: Array.isArray(events) ? events : [],
    };
  } catch {
    return { generatedAt: new Date().toISOString(), events: [] };
  }
}

export function clearAuthDiagnosticReport() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(CORRELATION_KEY);
  } catch {
    // Ignore unavailable browser storage.
  }
}

export function getAuthDiagnosticCorrelationId() {
  return getCorrelationId();
}
