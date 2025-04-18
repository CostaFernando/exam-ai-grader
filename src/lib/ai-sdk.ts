import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

export type Provider = "google" | "openai" | "anthropic";
export type ModelName = string;

export function getAIProvider(provider: Provider) {
  switch (provider) {
    case "google":
      return createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY,
        baseURL: "https://gateway.helicone.ai/v1beta",
        headers: {
          "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
          "Helicone-Target-URL": "https://generativelanguage.googleapis.com",
        },
      });
    case "openai":
      return createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: "https://oai.helicone.ai/v1",
        headers: {
          "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
        },
      });
    case "anthropic":
      return createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
        baseURL: "https://anthropic.helicone.ai/v1",
        headers: {
          "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
        },
      });
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
