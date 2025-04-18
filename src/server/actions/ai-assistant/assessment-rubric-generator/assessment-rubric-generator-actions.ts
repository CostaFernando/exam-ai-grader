"use server";

import { generateText } from "ai";
import { getAIProvider, Provider, ModelName } from "@/lib/ai-sdk";

export async function generateAssessmentRubric(
  assessmentFile: File,
  provider: Provider = "google",
  modelName: ModelName = "gemini-2.0-flash"
): Promise<string> {
  const system = `Você é um professor especialista em avaliações. Você receberá um arquivo com as questões de uma prova e, baseado nisso, sugerirá rubricas (critérios) de avaliação para cada questão da prova.

Tenha alguns pontos em mente:
- Você deve especificar quantos pontos vale a questão como um todo.
- Se a questão for dividida em alternativas, explicite quantos pontos vale cada alternativa, para compor a pontuação total da questão. Explicite também as rubricas de avaliação para cada alternativa.
- Diga quantos pontos vale cada rubrica de avaliação para compor a nota total da questão ou da alternativa.`;

  const aiProvider = getAIProvider(provider);

  const { text } = await generateText({
    model: aiProvider(modelName),
    headers: {
      "Helicone-Property-Feature": "generate-assessment-rubric",
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
