import "server-only";

import { db } from ".";

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
