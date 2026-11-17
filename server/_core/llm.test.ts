import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ENV } from "./env";
import { invokeLLM } from "./llm";

vi.mock("./env", () => ({
  ENV: {
    forgeApiKey: "",
    forgeApiUrl: "",
    llmProvider: "forge",
    groqApiKey: "",
    groqModel: "openai/gpt-oss-120b",
  },
}));

describe("invokeLLM provider configuration", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    ENV.forgeApiKey = "";
    ENV.forgeApiUrl = "";
    ENV.llmProvider = "forge";
    ENV.groqApiKey = "";
    ENV.groqModel = "openai/gpt-oss-120b";
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: vi.fn().mockResolvedValue({
        id: "mock-completion",
        created: 1,
        model: "mock-model",
        choices: [],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports a missing Forge key before making a provider request", async () => {
    await expect(
      invokeLLM({ messages: [{ role: "user", content: "hello" }] })
    ).rejects.toThrow("BUILT_IN_FORGE_API_KEY is not configured");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps the existing Forge endpoint, key, model and request parameters by default", async () => {
    ENV.forgeApiKey = "test-forge-key";

    await invokeLLM({
      messages: [{ role: "user", content: "hello" }],
      maxTokens: 700,
    });

    const [url, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(requestInit.body));
    expect(url).toBe("https://forge.manus.im/v1/chat/completions");
    expect((requestInit.headers as Record<string, string>).authorization).toBe(
      "Bearer test-forge-key"
    );
    expect(payload.model).toBe("gemini-2.5-flash");
    expect(payload.max_tokens).toBe(32768);
    expect(payload.thinking).toEqual({ budget_tokens: 128 });
  });

  it("routes only the SCP LLM request through Groq with its own key and compatible payload", async () => {
    ENV.llmProvider = "groq";
    ENV.forgeApiKey = "must-not-be-used-for-groq";
    ENV.groqApiKey = "test-groq-key";
    ENV.groqModel = "openai/gpt-oss-20b";

    await invokeLLM({
      messages: [{ role: "user", content: "inspect this mission" }],
      tools: [{
        type: "function",
        function: {
          name: "inspect_current_mission",
          description: "Read the current mission",
          parameters: { type: "object", properties: {} },
        },
      }],
      toolChoice: "auto",
      maxTokens: 6000,
    });

    const [url, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(requestInit.body));
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect((requestInit.headers as Record<string, string>).authorization).toBe(
      "Bearer test-groq-key"
    );
    expect(payload.model).toBe("openai/gpt-oss-20b");
    expect(payload.max_completion_tokens).toBe(6000);
    expect(payload.reasoning_format).toBe("hidden");
    expect(payload.tool_choice).toBe("auto");
    expect(payload.thinking).toBeUndefined();
  });

  it("fails closed when Groq is selected without its key", async () => {
    ENV.llmProvider = "groq";
    ENV.forgeApiKey = "must-not-be-used-as-groq-key";

    await expect(
      invokeLLM({ messages: [{ role: "user", content: "hello" }] })
    ).rejects.toThrow("GROQ_API_KEY is not configured");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects Groq tool calling combined with structured outputs before any request", async () => {
    ENV.llmProvider = "groq";
    ENV.groqApiKey = "test-groq-key";

    await expect(
      invokeLLM({
        messages: [{ role: "user", content: "hello" }],
        tools: [{
          type: "function",
          function: { name: "inspect", parameters: { type: "object" } },
        }],
        responseFormat: {
          type: "json_schema",
          json_schema: {
            name: "result",
            schema: { type: "object", properties: {}, additionalProperties: false },
          },
        },
      })
    ).rejects.toThrow("Groq does not support tool calling and structured outputs");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects unknown provider names without falling back to a different credential", async () => {
    ENV.llmProvider = "unexpected-provider";
    ENV.forgeApiKey = "test-forge-key";
    ENV.groqApiKey = "test-groq-key";

    await expect(
      invokeLLM({ messages: [{ role: "user", content: "hello" }] })
    ).rejects.toThrow("LLM_PROVIDER must be either 'forge' or 'groq'");

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
