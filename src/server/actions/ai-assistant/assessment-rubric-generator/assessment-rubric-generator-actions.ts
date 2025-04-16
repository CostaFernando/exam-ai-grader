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

export async function generateAssessmentRubric(
  assessmentFile: File
): Promise<string> {
  const system = `Você é um professor especialista em avaliações. Você receberá um arquivo com as questões de uma prova e, baseado nisso, sugerirá rubricas (critérios) de avaliação para cada questão da prova.

Tenha alguns pontos em mente:
- Você deve especificar quantos pontos vale a questão como um todo.
- Se a questão for dividida em alternativas, explicite quantos pontos vale cada alternativa, para compor a pontuação total da questão. Explicite também as rubricas de avaliação para cada alternativa.
- Diga quantos pontos vale cada rubrica de avaliação para compor a nota total da questão ou da alternativa.`;

  const { text } = await generateText({
    model: google("gemini-2.0-flash"),
    headers: {
      "Helicone-Property-Feature": "generate-assessment-rubric",
      "Helicone-Property-Source": "assessment-ai-grader",
    },
    system,
    temperature: 0.7,
    maxTokens: 2000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Baseado nesta prova, gere as rubricas de avaliação para cada questão.",
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

export async function generateAnswerKey(assessmentFile: File): Promise<string> {
  // dummy return
  return "dummy answer key";
}
