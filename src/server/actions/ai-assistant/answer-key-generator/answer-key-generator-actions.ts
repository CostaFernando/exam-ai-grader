"use server";

import { generateText } from "ai";
import { getAIProvider, Provider, ModelName } from "@/lib/ai-sdk";

export async function generateAnswerKey(
  assessmentFile: File,
  provider: Provider = "google",
  modelName: ModelName = "gemini-2.0-flash"
): Promise<string> {
  const system = `Você é um professor especialista em avaliações. Você receberá um arquivo com as questões de uma prova e, baseado nisso, escreverá o gabarito com solução para cada questão.`;

  const aiProvider = getAIProvider(provider);

  const { text } = await generateText({
    model: aiProvider(modelName),
    headers: {
      "Helicone-Property-Feature": "generate-answer-key",
      "Helicone-Property-Source": "assessment-ai-grader",
    },
    system,
    temperature: 1,
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
