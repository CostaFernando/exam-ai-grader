"use server";
import { generateObject, type CoreMessage } from "ai";
import { z } from "zod";
import { getAIProvider } from "@/lib/ai-sdk";
import type { Provider, ModelName } from "@/lib/ai-sdk";

const GRADER_SYSTEM = `Você é um avaliador de exams especializado, justo e rigoroso. Você fornece correções detalhadas, atribuindo notas precisas com base em critérios claros e dando feedback construtivo para ajudar os estudantes a entenderem seus erros e melhorarem continuamente.

Você receberá as questões da prova, as rubricas (critérios) de avaliação, o gabarito e as respostas do estudante.

Seu objetivo é analisar a questão original, as rubricas de avaliação, o gabarito e a resposta do aluno e, com base nisso, fornecer um feedback para o aluno, seguido de uma nota para a resposta.

Diretrizes a serem seguidas:
- As rubricas de avaliação determinam quantos pontos cada questão, alternativa e critério valem.
- A nota deve ter duas casas decimais, utilizando "." como separador. Exemplo: 2.00, 0.75, 1.50.
- Sua avaliação e nota deve ser baseada na rubrica de avaliação e no gabarito.
- Seu feedback deve ser falando diretamente para o aluno ler e detalhado para o aluno entender, principalmente, o que ele errou. Deve ser rigoroso, quando necessário, mas deve ajudar o estudante a entender seus erros.
- Seu feedback deve conter a nota final da questão, a nota por critério e a nota por alternativa (se houver).
- Você deve dar sua nota para cada critério ou alternativa da questão. A nota final deve ser a soma das notas em cada alternativa ou critério da questão.
- Preste particular atenção a imagens e diagramas nas respostas do estudante. Preste atenção nos detalhes.`;

const REVIEWER_SYSTEM = `Você é um revisor crítico de avaliações. Seu papel:
- Ver a prova, o gabarito, as respostas do aluno e a avaliação feita pelo avaliador.
- Verificar se o feedback para o aluno é claro, alinhado com a rubrica/gabarito.
- Verificar se as notas dadas fazem sentido.
- Sugerir melhorias específicas se algo estiver errado, faltando ou puder ser mais claro.
- Retornar uma nota de qualidade (1-5) para a avaliação, onde 5 é excelente.
- Se o estudante cometeu algum erro na questão e o avaliador não identificou, deixe claro que a questão precisa ser corrigida novamente.
- Se houver qualquer uma das questões que precisem de correção novamente, dê uma nota abaixo de 4 para o avaliador.
- Não é para você criticar o gabarito, trate o gabarito como a fonte da verdade.
Responda no schema especificado.`;

type GraderOutput = {
  questoes: {
    questaoNumero: number;
    feedback: string;
    nota: number;
  }[];
};

type ReviewOutput = {
  quality_score: number;
  overall_feedback: string;
};

async function runGrader(params: {
  assessmentFile: File;
  answerSheet: File;
  gradingRubric: string;
  answerKey: string;
  provider: Provider;
  modelName: ModelName;
  improvementContext?: { previousAssessment: GraderOutput; reviewerFeedback: ReviewOutput };
}): Promise<GraderOutput> {
  const { assessmentFile, answerSheet, gradingRubric, answerKey, provider, modelName, improvementContext } = params;
  const aiProvider = getAIProvider(provider);

  const messages: CoreMessage[] = [
    {
      role: "user",
      content: [
        { type: "text", text: "Estas são as questões da prova:" },
        { type: "file", data: await assessmentFile.arrayBuffer(), mimeType: "application/pdf" },
        { type: "text", text: `Estes são os critérios de correção:\n${gradingRubric}` },
        { type: "text", text: `Este é o gabarito:\n${answerKey}` },
        { type: "text", text: "Esta é a prova do estudante:" },
        { type: "file", data: await answerSheet.arrayBuffer(), mimeType: "application/pdf" },
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
          )}\n\nEste é o feedback do revisor apontando problemas/ajustes:\n${JSON.stringify(
            improvementContext.reviewerFeedback,
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
              questaoNumero: z.number().describe("Número identificador da questão."),
              feedback: z
                .string()
                .describe(
                  "Feedback detalhado para o estudante, deixando claro a pontuação que o estudante tirou em cada critério e alternativa da questão. Explicando os erros e como melhorar.",
                ),
              nota: z
                .number()
                .describe("Nota final da questão (soma das notas por critério), com duas casas decimais."),
            })
            .strict(),
        ),
      })
      .strict(),
    system: GRADER_SYSTEM,
    temperature: 1,
    messages,
  });

  return object as GraderOutput;
}

async function runReviewer(params: {
  assessmentFile: File;
  answerSheet: File;
  gradingRubric: string;
  answerKey: string;
  graderOutput: GraderOutput;
  provider: Provider;
  modelName: ModelName;
}): Promise<ReviewOutput> {
  const { assessmentFile, answerSheet, gradingRubric, answerKey, graderOutput, provider, modelName } = params;
  const aiProvider = getAIProvider(provider);

  const { object } = await generateObject({
    model: aiProvider(modelName),
    headers: {
      "Helicone-Property-Feature": "review-graded-answer-sheet",
      "Helicone-Property-Source": "assessment-ai-grader",
    },
    schema: z
      .object({
        quality_score: z
          .number()
          .describe("Nota de 1 a 5 para a qualidade da avaliação do avaliador."),
        overall_feedback: z
          .string()
          .describe(
            "Feedback geral sobre a avaliação do avaliador, o que melhorar, o que está bom.",
          ),
      })
      .strict(),
    system: REVIEWER_SYSTEM,
    temperature: 1,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Estas são as questões da prova:" },
          { type: "file", data: await assessmentFile.arrayBuffer(), mimeType: "application/pdf" },
          { type: "text", text: `Estes são os critérios de correção:\n${gradingRubric}` },
          { type: "text", text: `Este é o gabarito:\n${answerKey}` },
          { type: "text", text: "Esta é a prova do estudante:" },
          { type: "file", data: await answerSheet.arrayBuffer(), mimeType: "application/pdf" },
          {
            type: "text",
            text: `Avaliação do avaliador (feedbacks e notas por questão):\n${JSON.stringify(graderOutput)}`,
          },
        ],
      },
    ],
  });

  return object as ReviewOutput;
}

export async function gradeAnswerSheet(
  assessmentFile: File,
  answerSheet: File,
  gradingRubric: string,
  answerKey: string,
): Promise<{
  score: number;
  feedback: string;
  reviewQuality?: number;
  reviewFeedback?: string;
  regraded: boolean;
}> {
  const provider: Provider = (process.env.LLM_PROVIDER as Provider) ?? "google";
  const modelName: ModelName = process.env.LLM_MODEL ?? "gemini-2.5-flash-preview-04-17";

  const reviewEnabled = process.env.REVIEWER_AGENT_ENABLED === "true";
  const reviewThreshold = Number(process.env.REVIEWER_QUALITY_THRESHOLD ?? "4");
  const reviewerProvider: Provider =
    (process.env.REVIEWER_LLM_PROVIDER as Provider) ?? (process.env.LLM_PROVIDER as Provider) ?? "google";
  const reviewerModel: ModelName =
    process.env.REVIEWER_LLM_MODEL ?? process.env.LLM_MODEL ?? "gemini-2.5-flash-preview-04-17";

  const firstAssessment = await runGrader({
    assessmentFile,
    answerSheet,
    gradingRubric,
    answerKey,
    provider,
    modelName,
  });

  let finalAssessment = firstAssessment;
  let regraded = false;
  let reviewQuality: number | undefined;
  let reviewFeedback: string | undefined;

  if (reviewEnabled) {
    const review = await runReviewer({
      assessmentFile,
      answerSheet,
      gradingRubric,
      answerKey,
      graderOutput: firstAssessment,
      provider: reviewerProvider,
      modelName: reviewerModel,
    });

    reviewQuality = review.quality_score;
    reviewFeedback = review.overall_feedback;

    if (review.quality_score < reviewThreshold) {
      regraded = true;
      finalAssessment = await runGrader({
        assessmentFile,
        answerSheet,
        gradingRubric,
        answerKey,
        provider,
        modelName,
        improvementContext: {
          previousAssessment: firstAssessment,
          reviewerFeedback: review,
        },
      });
    }
  }

  const score = finalAssessment.questoes.reduce((acc, questao) => acc + Number(questao.nota), 0);
  const feedback = finalAssessment.questoes.map((questao) => questao.feedback).join("\n\n");

  return { score, feedback, reviewQuality, reviewFeedback, regraded };
}

export type GradeResult = {
  id: number;
  score?: number;
  feedback?: string;
  reviewQuality?: number;
  reviewFeedback?: string;
  regraded?: boolean;
  error?: string;
};

export async function gradeMultipleAnswerSheets(
  examFile: File,
  answers: { id: number; file: File }[],
  gradingRubric: string,
  answerKey: string,
): Promise<GradeResult[]> {
  const results = await Promise.all(
    answers.map(async ({ id, file }) => {
      try {
        const { score, feedback, reviewQuality, reviewFeedback, regraded } = await gradeAnswerSheet(
          examFile,
          file,
          gradingRubric,
          answerKey,
        );
        return { id, score, feedback, reviewQuality, reviewFeedback, regraded };
      } catch (err: unknown) {
        let errorMessage = "Grading failed";
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === "string") {
          errorMessage = err;
        }
        return { id, error: errorMessage };
      }
    }),
  );
  return results;
}
