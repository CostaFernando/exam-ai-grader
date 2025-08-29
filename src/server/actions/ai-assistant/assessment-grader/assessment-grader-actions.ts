"use server";
import { generateObject } from "ai";
import { z } from "zod";
import { getAIProvider } from "@/lib/ai-sdk";
import type { Provider, ModelName } from "@/lib/ai-sdk";

export async function gradeAnswerSheet(
  assessmentFile: File,
  answerSheet: File,
  gradingRubric: string,
  answerKey: string,
  improvementContext?: {
    previousAssessment: unknown;
    reviewerFeedback: unknown;
  }
): Promise<{
  score: number;
  feedback: string;
  assessment: unknown;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messages: { role: "user"; content: any[] }[] = [
      {
        role: "user",
        content: [
          { type: "text", text: "Estas são as questões da prova:" },
          {
            type: "file",
            data: await assessmentFile.arrayBuffer(),
            mimeType: "application/pdf",
          },
          { type: "text", text: `Estes são os critérios de correção:\n${gradingRubric}` },
          { type: "text", text: `Este é o gabarito:\n${answerKey}` },
          { type: "text", text: "Esta é a prova do estudante:" },
          {
            type: "file",
            data: await answerSheet.arrayBuffer(),
            mimeType: "application/pdf",
          },
        ],
      },
    ];

    if (improvementContext) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: `Esta é a avaliação anterior feita por você:\n${JSON.stringify(
              improvementContext.previousAssessment,
              null,
              2
            )}\n\nEste é o feedback do revisor apontando problemas/ajustes:\n${JSON.stringify(
              improvementContext.reviewerFeedback,
              null,
              2
            )}\n\nPor favor, refaça a avaliação final melhorada.`,
          },
        ],
      });
    }

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
      messages,
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
      assessment: object,
    };
  } catch (error) {
    console.error("Error grading answer sheet:", error);
    throw error;
  }
}

export async function reviewAnswerSheet(
  assessmentFile: File,
  answerSheet: File,
  gradingRubric: string,
  answerKey: string,
  graderOutput: unknown
): Promise<{ qualityScore: number; overallFeedback: string }> {
  const provider: Provider =
    (process.env.REVIEWER_PROVIDER as Provider) ||
    ((process.env.LLM_PROVIDER as Provider) ?? "google");
  const modelName: ModelName =
    process.env.REVIEWER_MODEL ||
    (process.env.LLM_MODEL ?? "gemini-2.5-flash-preview-04-17");

  const system = `Você é um revisor crítico de avaliações. Seu papel:
- Ver a prova, o gabarito, as respostas do aluno e a avaliação feita pelo avaliador.
- Verificar se o feedback para o aluno é claro, alinhado com a rubrica/gabarito.
- Verificar se as notas dadas fazem sentido.
- Sugerir melhorias específicas se algo estiver errado, faltando ou puder ser mais claro.
- Retornar uma nota de qualidade (1-5) para a avaliação, onde 5 é excelente.
- Se o estudante cometeu algum erro na questão e o avaliador não identificou, deixe claro que a questão precisa ser corrigida novamente.
- Se houver qualquer uma das questões que precisem de correção novamente, dê uma nota abaixo de 4 para o avaliador.
- Não é para você criticar o gabarito, trate o gabarito como a fonte da verdade.
Responda no schema especificado.`;

  const aiProvider = getAIProvider(provider);

  const { object } = await generateObject({
    model: aiProvider(modelName),
    headers: {
      "Helicone-Property-Feature": "review-answer-sheet",
      "Helicone-Property-Source": "assessment-ai-grader",
    },
    schema: z
      .object({
        quality_score: z
          .number()
          .describe(
            "Nota de 1 a 5 para a qualidade da avaliação do avaliador."
          ),
        overall_feedback: z
          .string()
          .describe(
            "Feedback geral sobre a avaliação do avaliador, o que melhorar, o que está bom."
          ),
      })
      .strict(),
    system,
    temperature: 1,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Estas são as questões da prova:" },
          {
            type: "file",
            data: await assessmentFile.arrayBuffer(),
            mimeType: "application/pdf",
          },
          {
            type: "text",
            text: `Estes são os critérios de correção:\n${gradingRubric}`,
          },
          { type: "text", text: `Este é o gabarito:\n${answerKey}` },
          { type: "text", text: "Esta é a prova do estudante:" },
          {
            type: "file",
            data: await answerSheet.arrayBuffer(),
            mimeType: "application/pdf",
          },
          {
            type: "text",
            text: `Avaliação do avaliador (feedbacks e notas por questão):\n${JSON.stringify(
              graderOutput,
              null,
              2
            )}`,
          },
        ],
      },
    ],
  });

  return {
    qualityScore: object.quality_score,
    overallFeedback: object.overall_feedback,
  };
}
export type GradeResult = {
  id: number;
  score?: number;
  feedback?: string;
  reviewQuality?: number;
  reviewFeedback?: string;
  reAssessed?: boolean;
  error?: string;
};

export async function gradeMultipleAnswerSheets(
  examFile: File,
  answers: { id: number; file: File }[],
  gradingRubric: string,
  answerKey: string
): Promise<GradeResult[]> {
  const reviewEnabled = process.env.REVIEWER_ENABLED === "true";
  const qualityThreshold = Number(
    process.env.REVIEWER_QUALITY_THRESHOLD ?? 4
  );

  const results = await Promise.all(
    answers.map(async ({ id, file }) => {
      try {
        const first = await gradeAnswerSheet(
          examFile,
          file,
          gradingRubric,
          answerKey
        );

        let finalAssessment = first;
        let reviewQuality: number | undefined;
        let reviewFeedback: string | undefined;
        let reAssessed = false;

        if (reviewEnabled) {
          const review = await reviewAnswerSheet(
            examFile,
            file,
            gradingRubric,
            answerKey,
            first.assessment
          );

          reviewQuality = review.qualityScore;
          reviewFeedback = review.overallFeedback;

          if (review.qualityScore < qualityThreshold) {
            finalAssessment = await gradeAnswerSheet(
              examFile,
              file,
              gradingRubric,
              answerKey,
              {
                previousAssessment: first.assessment,
                reviewerFeedback: review,
              }
            );
            reAssessed = true;
          }
        }

        return {
          id,
          score: finalAssessment.score,
          feedback: finalAssessment.feedback,
          reviewQuality,
          reviewFeedback,
          reAssessed,
        };
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
