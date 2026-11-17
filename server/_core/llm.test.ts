import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { invokeLLM } from "./llm";

vi.mock("./env", () => ({
  ENV: { forgeApiKey: "" },
}));

describe("invokeLLM Forge configuration", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports the configured Forge key name before making a provider request", async () => {
    await expect(
      invokeLLM({ messages: [{ role: "user", content: "hello" }] })
    ).rejects.toThrow("BUILT_IN_FORGE_API_KEY is not configured");

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
