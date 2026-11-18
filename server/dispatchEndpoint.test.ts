import { describe, expect, it } from "vitest";
import { isValidOptionalIdempotencyKey } from "./dispatchEndpoint";

describe("dispatch idempotency key validation", () => {
  it("accepts an omitted key for regular missions", () => {
    expect(isValidOptionalIdempotencyKey(undefined)).toBe(true);
  });

  it("accepts JSON null as an omitted key for regular missions", () => {
    expect(isValidOptionalIdempotencyKey(null)).toBe(true);
  });

  it("accepts a valid ACTION_PLAN idempotency key", () => {
    expect(isValidOptionalIdempotencyKey("unit-idempotency-key-0001")).toBe(true);
  });

  it("rejects malformed non-null keys", () => {
    expect(isValidOptionalIdempotencyKey("short")).toBe(false);
    expect(isValidOptionalIdempotencyKey(123)).toBe(false);
    expect(isValidOptionalIdempotencyKey({})).toBe(false);
  });
});
