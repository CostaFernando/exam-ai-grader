"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Download,
  Edit,
  FileText,
  Upload,
  Loader2,
} from "lucide-react";
import { initializeDatabase } from "@/db";
import { eq } from "drizzle-orm";
import { examsTable, examStatusEnum } from "@/db/schema";
import { format } from "date-fns";

// Define types based on schema
type Exam = {
  id: number;
  name: string;
  description: string | null;
  status: (typeof examStatusEnum.enumValues)[number];
  gradingRubric: string | null;
  answerSheet: string | null;
  url: string | null;
  createdAt: Date;
  updatedAt: Date;
  questions: Question[];
  examAnswers: ExamAnswer[];
};

type Question = {
  id: number;
  examId: number;
  text: string;
  maxScore: number;
  createdAt: Date;
  updatedAt: Date;
};

type ExamAnswer = {
  id: number;
  examId: number;
  questionId: number;
  studentId: number;
  answersUrl: string | null;
  score: number;
  feedback: string | null;
  createdAt: Date;
  updatedAt: Date;
  student: {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
};

export default function ExamDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const examId = params.id;

  const [exam, setExam] = useState<Exam | null>(null);
  const [db, setDb] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Initialize database connection
  useEffect(() => {
    async function initializeDatabaseAndSetDb() {
      try {
        const database = await initializeDatabase();
        setDb(database);
      } catch (err) {
        console.error("Failed to initialize database:", err);
        setError("Failed to connect to database");
        setLoading(false);
      }
    }

    initializeDatabaseAndSetDb();
  }, []);

  // Fetch exam data when database is ready
  useEffect(() => {
    async function fetchExam() {
      if (!db || !examId) return;

      try {
        setLoading(true);
        const result = await db.query.examsTable.findFirst({
          where: eq(examsTable.id, parseInt(examId)),
          with: {
            questions: true,
            examAnswers: {
              with: {
                student: true,
              },
            },
          },
        });

        if (!result) {
          setError("Exam not found");
        } else {
          setExam(result);
        }
      } catch (err) {
        console.error("Error fetching exam:", err);
        setError("Failed to load exam data");
      } finally {
        setLoading(false);
      }
    }

    if (db && examId) {
      fetchExam();
    }
  }, [db, examId]);

  // Helper function to format status display
  const formatStatus = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "Active";
      case "COMPLETED":
        return "Completed";
      case "ARCHIVED":
        return "Archived";
      default:
        return status;
    }
  };

  // Helper function to get badge variant based on status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "default";
      case "COMPLETED":
        return "secondary";
      case "ARCHIVED":
        return "outline";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500">Loading exam details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Exam Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested exam could not be found.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/provas")}>
              View All Exams
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Calculate statistics
  const totalQuestions = exam.questions.length;
  const totalScore = exam.questions.reduce((sum, q) => sum + q.maxScore, 0);

  // Count distinct students who have answers
  const uniqueStudentIds = new Set(
    exam.examAnswers.map((answer) => answer.studentId)
  );
  const studentsGraded = uniqueStudentIds.size;

  // Format date
  const createdDate =
    exam.createdAt instanceof Date
      ? format(exam.createdAt, "yyyy-MM-dd")
      : format(new Date(exam.createdAt), "yyyy-MM-dd");

  // Calculate scores if there are student answers
  let averageScore = 0;
  let highestScore = 0;
  let lowestScore = 0;

  if (studentsGraded > 0) {
    // Group answers by student
    const studentScores = Array.from(uniqueStudentIds).map((studentId) => {
      const studentAnswers = exam.examAnswers.filter(
        (answer) => answer.studentId === studentId
      );
      const totalScoreForStudent = studentAnswers.reduce(
        (sum, answer) => sum + answer.score,
        0
      );
      return (totalScoreForStudent / totalScore) * 100;
    });

    averageScore =
      studentScores.reduce((sum, score) => sum + score, 0) /
      studentScores.length;
    highestScore = Math.max(...studentScores);
    lowestScore = Math.min(...studentScores);
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{exam.name}</h1>
        <Badge variant={getStatusVariant(exam.status)}>
          {formatStatus(exam.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalQuestions}</div>
            <p className="text-sm text-gray-500">Total questions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Students Graded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {studentsGraded} / {studentsGraded}{" "}
              {/* Could be updated with enrolled students count if available */}
            </div>
            <p className="text-sm text-gray-500">
              {studentsGraded > 0 ? "In progress" : "No submissions"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{createdDate}</div>
            <p className="text-sm text-gray-500">Date created</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <Link href={`/provas/${examId}/edit`}>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Test
          </Button>
        </Link>
        <Link href={`/answers/upload?examId=${examId}`}>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Student Answers
          </Button>
        </Link>
        {exam.url && (
          <Button variant="outline" asChild>
            <a href={exam.url} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Download Test PDF
            </a>
          </Button>
        )}
      </div>

      <Tabs defaultValue="details">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Test Details</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="rubric">Grading Rubric</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Test Information</CardTitle>
              <CardDescription>Details about this test</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-gray-600">
                    {exam.description || "No description provided"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Total Points</h3>
                  <p className="text-gray-600">{totalScore} points</p>
                </div>
                {exam.url && (
                  <div>
                    <h3 className="font-medium">Test PDF</h3>
                    <div className="flex items-center mt-2">
                      <FileText className="h-6 w-6 text-gray-400 mr-2" />
                      <span className="text-sm">View PDF</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                        asChild
                      >
                        <a
                          href={exam.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <CardTitle>Test Questions</CardTitle>
              <CardDescription>Questions included in this test</CardDescription>
            </CardHeader>
            <CardContent>
              {exam.questions.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">
                    No questions have been added to this exam.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {exam.questions.map((question, index) => (
                    <div key={question.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">Question {index + 1}</h3>
                        <Badge variant="outline">
                          {question.maxScore} points
                        </Badge>
                      </div>
                      <p className="text-gray-600">{question.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rubric">
          <Card>
            <CardHeader>
              <CardTitle>Grading Rubric</CardTitle>
              <CardDescription>
                Criteria used for grading student answers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exam.gradingRubric ? (
                <div className="whitespace-pre-line bg-gray-50 p-4 rounded-lg text-gray-700 font-mono text-sm">
                  {exam.gradingRubric}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">
                    No grading rubric has been set for this exam.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href={`/provas/${examId}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Rubric
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>Overview of student performance</CardDescription>
            </CardHeader>
            <CardContent>
              {studentsGraded > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Average Score</p>
                      <p className="text-2xl font-bold">
                        {averageScore.toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Highest Score</p>
                      <p className="text-2xl font-bold">
                        {highestScore.toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Lowest Score</p>
                      <p className="text-2xl font-bold">
                        {lowestScore.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <Link href={`/results?examId=${examId}`}>
                    <Button className="w-full">View Detailed Results</Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">No results available yet</p>
                  <Link href={`/answers/upload?examId=${examId}`}>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Student Answers
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
