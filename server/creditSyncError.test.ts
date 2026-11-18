import { describe, expect, it } from "vitest";
import { CreditSyncError, getCreditSyncErrorCode, getCreditSyncHttpStatus } from "./creditSyncError";

describe("credit sync error classification", () => {
  it("preserves a known stable error code", () => {
    const error = new CreditSyncError("request_failed", 403);
    expect(getCreditSyncErrorCode(error)).toBe("request_failed");
    expect(getCreditSyncHttpStatus(error)).toBe(403);
  });

  it("does not propagate arbitrary provider text", () => {
    const error = Object.assign(new Error("sensitive provider payload"), {
      code: "sensitive provider payload",
    });
    expect(getCreditSyncErrorCode(error)).toBe("sync_failed");
    expect(getCreditSyncHttpStatus({ httpStatus: 999 })).toBeUndefined();
  });
});
