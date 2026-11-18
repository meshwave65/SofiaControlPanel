export const CREDIT_SYNC_ERROR_CODES = [
  "credentials_missing",
  "request_failed",
  "response_invalid",
  "sync_failed",
] as const;

export type CreditSyncErrorCode = (typeof CREDIT_SYNC_ERROR_CODES)[number];

export function getCreditSyncHttpStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object" || !("httpStatus" in error)) return undefined;
  const status = (error as { httpStatus?: unknown }).httpStatus;
  return typeof status === "number" && Number.isInteger(status) && status >= 100 && status <= 599
    ? status
    : undefined;
}

export class CreditSyncError extends Error {
  readonly code: CreditSyncErrorCode;
  readonly httpStatus?: number;

  constructor(code: CreditSyncErrorCode, httpStatus?: number) {
    super(code);
    this.name = "CreditSyncError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

export function getCreditSyncErrorCode(error: unknown): CreditSyncErrorCode {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string" && CREDIT_SYNC_ERROR_CODES.includes(code as CreditSyncErrorCode)) {
      return code as CreditSyncErrorCode;
    }
  }

  return "sync_failed";
}
