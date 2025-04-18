"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, RefreshCw, Loader2 } from "lucide-react";
import { ResultsTable } from "@/components/results-table";
import { ResultsChart } from "@/components/results-chart";
import { initializeDatabase } from "@/db";
import { examsTable, examAnswersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

type Exam = {
  id: number;
  name: string;
};

type ExamAnswer = {
  id: number;
  examId: number;
  name: string;
  score: number | null;
  feedback: string | null;
};

type GradingStatus = {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
};

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const paramExamId = searchParams.get("examId");

  const [selectedExam, setSelectedExam] = useState(paramExamId || "");
  const [exams, setExams] = useState<Exam[]>([]);
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [gradingStatus, setGradingStatus] = useState<GradingStatus>({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [averageScore, setAverageScore] = useState(0);

  // Fetch exams
  useEffect(() => {
    async function fetchExams() {
      try {
        const db = await initializeDatabase();
        const result = await db.query.examsTable.findMany();
        setExams(result);

        // If we have an examId in the URL and it's not already set
        if (paramExamId && !selectedExam) {
          setSelectedExam(paramExamId);
        }
      } catch (err) {
        console.error("Error fetching exams:", err);
        setError("Failed to load exams");
      }
    }

    fetchExams();
  }, [paramExamId, selectedExam]);

  // Fetch answers for selected exam
  useEffect(() => {
    async function fetchAnswers() {
      if (!selectedExam) return;

      try {
        setLoading(true);
        const db = await initializeDatabase();
        const examId = Number(selectedExam);

        const result = await db.query.examAnswersTable.findMany({
          where: eq(examAnswersTable.examId, examId),
        });

        setAnswers(result);

        // Calculate grading status
        const total = result.length;
        const completed = result.filter(
          (a) => a.score !== null && a.feedback !== null
        ).length;
        const inProgress = result.filter(
          (a) =>
            (a.score !== null && a.feedback === null) ||
            (a.score === null && a.feedback !== null)
        ).length;
        const pending = total - completed - inProgress;

        setGradingStatus({
          total,
          completed,
          inProgress,
          pending,
        });

        // Calculate average score
        if (completed > 0) {
          const totalScore = result.reduce(
            (sum, answer) => sum + (answer.score || 0),
            0
          );
          setAverageScore(Math.round(totalScore / completed));
        } else {
          setAverageScore(0);
        }
      } catch (err) {
        console.error("Error fetching answers:", err);
        setError("Failed to load answer data");
      } finally {
        setLoading(false);
      }
    }

    fetchAnswers();
  }, [selectedExam]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Grading Results</h1>
        <div className="flex items-center gap-2">
          <Select value={selectedExam} onValueChange={setSelectedExam}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a test" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id.toString()}>
                  {exam.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading results...</span>
        </div>
      ) : error ? (
        <div className="py-10 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      ) : !selectedExam ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Please select a test to view results</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Grading Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">
                      {gradingStatus.completed} / {gradingStatus.total}
                    </span>
                    <Badge
                      variant={
                        gradingStatus.pending > 0 ? "outline" : "default"
                      }
                    >
                      {gradingStatus.pending > 0 ? "In Progress" : "Completed"}
                    </Badge>
                  </div>
                  <Progress
                    value={
                      gradingStatus.total > 0
                        ? (gradingStatus.completed / gradingStatus.total) * 100
                        : 0
                    }
                  />
                  <div className="grid grid-cols-3 text-center text-sm">
                    <div>
                      <p className="text-gray-500">Completed</p>
                      <p className="font-bold">{gradingStatus.completed}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">In Progress</p>
                      <p className="font-bold">{gradingStatus.inProgress}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pending</p>
                      <p className="font-bold">{gradingStatus.pending}</p>
                    </div>
                  </div>
                  {gradingStatus.pending > 0 && (
                    <Button variant="outline" size="sm" className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Status
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-5xl font-bold">{averageScore}%</div>
                  <p className="text-sm text-gray-500 mt-2">Class Average</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[120px]">
                  <ResultsChart answers={answers} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="table">
            <TabsList className="mb-4">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="individual">Individual Results</TabsTrigger>
            </TabsList>

            <TabsContent value="table">
              <Card>
                <CardHeader>
                  <CardTitle>Student Results</CardTitle>
                  <CardDescription>
                    Complete grading results for{" "}
                    {exams.find((e) => e.id.toString() === selectedExam)
                      ?.name || "selected test"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResultsTable examId={selectedExam} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="individual">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {answers.map((answer) => (
                  <Card key={answer.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle>{answer.name}</CardTitle>
                        <Badge>{answer.score || "-"}%</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-500">Status:</div>
                          <div>
                            {answer.score && answer.feedback
                              ? "Completed"
                              : answer.score || answer.feedback
                              ? "In Progress"
                              : "Pending"}
                          </div>

                          <div className="text-gray-500">Score:</div>
                          <div>
                            {answer.score !== null
                              ? `${answer.score}/100`
                              : "-"}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Feedback
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {answers.length === 0 && (
                  <div className="col-span-3 text-center py-10">
                    <p className="text-gray-500">
                      No answer sheets available for this test
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
