"use server";
import { generateObject } from "ai";
import { z } from "zod";
import { getAIProvider } from "@/lib/ai-sdk";
import type { Provider, ModelName } from "@/lib/ai-sdk";

export async function gradeAnswerSheet(
  assessmentFile: File,
  answerSheet: File,
  gradingRubric: string,
  answerKey: string
): Promise<{
  score: number;
  feedback: string;
}> {
  const provider: Provider = (process.env.LLM_PROVIDER as Provider) ?? "google";
  const modelName: ModelName =
    process.env.LLM_MODEL ?? "gemini-2.5-flash-preview-04-17";

  const system = `Você é um avaliador de exams especializado, justo e rigoroso. Você fornece correções detalhadas, atribuindo notas precisas com base em critérios claros e dando feedback construtivo para ajudar os estudantes a entenderem seus erros e melhorarem continuamente.

Você receberá as questões da prova, as rubricas (critérios) de avaliação, o gabarito e as respostas do estudante.

Seu objetivo é analisar a questão original, as rubricas de avaliação, o gabarito e a resposta do aluno e, com base nisso, fornecer um feedback para o aluno, seguido de uma nota para a resposta.

Diretrizes a serem seguidas:
- As rubricas de avaliação determinam quantos pontos cada questão, alternativa e critério valem.
- A nota deve ter duas casas decimais, utilizando \".\" como separador. Exemplo: 2.00, 0.75, 1.50.
- Sua avaliação e nota deve ser baseada na rubrica de avaliação e no gabarito.
- Seu feedback deve ser falando diretamente para o aluno ler e detalhado para o aluno entender, principalmente, o que ele errou. Deve ser rigoroso, quando necessário, mas deve ajudar o estudante a entender seus erros.
- Seu feedback deve conter a nota final da questão, a nota por critério e a nota por alternativa (se houver).
- Você deve dar sua nota para cada critério ou alternativa da questão. A nota final deve ser a soma das notas em cada alternativa ou critério da questão.
- Preste particular atenção a imagens e diagramas nas respostas do estudante. Preste atenção nos detalhes.`;

  const aiProvider = getAIProvider(provider);

  try {
    const { object } = await generateObject({
      model: aiProvider(modelName),
      headers: {
        "Helicone-Property-Feature": "grade-answer-sheet",
        "Helicone-Property-Source": "assessment-ai-grader",
      },
      schema: z
        .object({
          questoes: z.array(
            z
              .object({
                questaoNumero: z
                  .number()
                  .describe("Número identificador da questão."),
                feedback: z
                  .string()
                  .describe(
                    "Feedback detalhado para o estudante, deixando claro a pontuação que o estudante tirou em cada critério e alternativa da questão. Explicando os erros e como melhorar."
                  ),
                nota: z
                  .number()
                  .describe(
                    "Nota final da questão (soma das notas por critério), com duas casas decimais."
                  ),
              })
              .strict()
          ),
        })
        .strict(),
      system,
      temperature: 1,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Estas são as questões da prova:",
            },
            {
              type: "file",
              data: await assessmentFile.arrayBuffer(),
              mimeType: "application/pdf",
            },
            {
              type: "text",
              text: `Estes são os critérios de correção:\n${gradingRubric}`,
            },
            {
              type: "text",
              text: `Este é o gabarito:\n${answerKey}`,
            },
            {
              type: "text",
              text: "Esta é a prova do estudante:",
            },
            {
              type: "file",
              data: await answerSheet.arrayBuffer(),
              mimeType: "application/pdf",
            },
          ],
        },
      ],
    });

    const score = object.questoes.reduce(
      (acc, questao) => acc + Number(questao.nota),
      0
    );
    const feedback = object.questoes
      .map((questao) => {
        return questao.feedback;
      })
      .join("\n\n");

    return {
      score,
      feedback,
    };
  } catch (error) {
    console.error("Error grading answer sheet:", error);
    throw error;
  }
}

export type GradeResult = {
  id: number;
  score?: number;
  feedback?: string;
  error?: string;
};

export async function gradeMultipleAnswerSheets(
  examFile: File,
  answers: { id: number; file: File }[],
  gradingRubric: string,
  answerKey: string
): Promise<GradeResult[]> {
  const results = await Promise.all(
    answers.map(async ({ id, file }) => {
      try {
        const { score, feedback } = await gradeAnswerSheet(
          examFile,
          file,
          gradingRubric,
          answerKey
        );
        return { id, score, feedback };
      } catch (err: unknown) {
        let errorMessage = "Grading failed";
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === "string") {
          errorMessage = err;
        }
        return { id, error: errorMessage };
      }
    })
  );
  return results;
}
