"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  baseURL: "https://gateway.helicone.ai/v1beta",
  headers: {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
    "Helicone-Target-URL": "https://generativelanguage.googleapis.com",
  },
});

export async function generateAnswerKey(assessmentFile: File): Promise<string> {
  const system = `Você é um professor especialista em avaliações. Você receberá um arquivo com as questões de uma prova e, baseado nisso, escreverá o gabarito com solução para cada questão.`;

  const { text } = await generateText({
    model: google("gemini-2.0-flash"),
    headers: {
      "Helicone-Property-Feature": "generate-answer-key",
      "Helicone-Property-Source": "assessment-ai-grader",
    },
    system,
    temperature: 0.7,
    maxTokens: 8000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Baseado nesta prova, gere o gabarito com solução para cada questão.",
          },
          {
            type: "file",
            data: await assessmentFile.arrayBuffer(),
            mimeType: "application/pdf",
          },
        ],
      },
    ],
  });

  return text;
}
