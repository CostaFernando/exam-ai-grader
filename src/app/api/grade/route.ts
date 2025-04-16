import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Handle both single answer grading and batch grading
    if (body.examId && !body.testId) {
      // This is a batch grading request for an entire exam
      const { examId } = body;

      // In a real implementation, you would:
      // 1. Fetch all answer sheets for this exam
      // 2. Fetch the exam's rubric and answer key
      // 3. Grade each answer sheet using AI

      // For now, we'll just return a mock response
      return Response.json({
        success: true,
        message: `Graded all answers for exam ${examId}`,
        completedCount: 5, // Mock number of graded answers
      });
    } else {
      // This is the existing single answer grading logic
      const { testId, studentId, answers, rubric, answerKey } = body;

      // Use AI to grade the answer
      const results = await Promise.all(
        answers.map(async (answer: any, index: number) => {
          const questionNumber = index + 1;
          const maxScore = rubric.questions[index].maxScore;
          const correctAnswer = answerKey.questions[index].answer;

          // Use AI to grade the answer
          const { text } = await generateText({
            model: openai("gpt-4o"),
            prompt: `
              Grade the following student answer for question ${questionNumber}.
              
              Question: ${rubric.questions[index].text}
              Max Score: ${maxScore}
              Correct Answer: ${correctAnswer}
              
              Student Answer: ${answer.text}
              
              Provide a score out of ${maxScore} and detailed feedback.
            `,
          });

          // Parse the AI response to extract score and feedback
          const scoreMatch = text.match(/Score:\s*(\d+)/i);
          const score = scoreMatch ? Number.parseInt(scoreMatch[1]) : 0;

          return {
            questionNumber,
            score,
            maxScore,
            feedback: text,
          };
        })
      );

      // Calculate total score
      const totalScore = results.reduce((sum, result) => sum + result.score, 0);
      const maxPossibleScore = results.reduce(
        (sum, result) => sum + result.maxScore,
        0
      );

      return Response.json({
        testId,
        studentId,
        totalScore,
        maxPossibleScore,
        percentage: Math.round((totalScore / maxPossibleScore) * 100),
        questions: results,
      });
    }
  } catch (error) {
    console.error("Error grading test:", error);
    return Response.json({ error: "Failed to grade test" }, { status: 500 });
  }
}
