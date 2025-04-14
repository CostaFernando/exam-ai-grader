// import "server-only";

import { db } from ".";
import { examsTable } from "./schema";

export async function getAllExams() {
  const exams = await db.query.examsTable.findMany({
    with: {
      questions: true,
      examAnswers: {
        with: {
          student: true,
        },
      },
    },
  });

  return exams;
}

export async function createExam(
  name: string,
  description: string,
  gradingRubric: string,
  answerSheet: string,
  url: string
) {
  const exam = await db
    .insert(examsTable)
    .values({
      name,
      description,
      gradingRubric,
      answerSheet,
      url,
    })
    .returning();

  return exam;
}
