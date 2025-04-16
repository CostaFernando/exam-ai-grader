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
  Eye,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initializeDatabase } from "@/db";
import { eq } from "drizzle-orm";
import { examsTable, examAnswersTable, examStatusEnum } from "@/db/schema";
import { format } from "date-fns";
import { toast } from "sonner";
import { openFileFromReference, cleanupBlobUrls } from "@/lib/indexedDB";

type Exam = {
  id: number;
  name: string;
  description: string | null;
  status: (typeof examStatusEnum.enumValues)[number];
  gradingRubric: string | null;
  answerKey: string | null;
  url: string | null;
  createdAt: Date;
  updatedAt: Date;
  examAnswers: ExamAnswer[];
};

type ExamAnswer = {
  id: number;
  examId: number;
  name: string;
  answerSheetUrl: string | null;
  score: number;
  feedback: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function ExamDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const examId = params.id;

  const [exam, setExam] = useState<Exam | null>(null);
  const [db, setDb] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadLoading, setDownloadLoading] = useState(false);

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

  useEffect(() => {
    async function fetchExam() {
      if (!db || !examId) return;

      try {
        setLoading(true);
        const result = await db.query.examsTable.findFirst({
          where: eq(examsTable.id, parseInt(examId)),
          with: {
            examAnswers: true,
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

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!exam?.url) return;

    try {
      setDownloadLoading(true);
      await openFileFromReference(exam.url);
    } catch (error) {
      console.error("Error opening file:", error);
      toast.error("Failed to open file");
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleViewAnswerSheet = async (answer: ExamAnswer) => {
    if (!answer.answerSheetUrl) return;

    try {
      setDownloadLoading(true);
      await openFileFromReference(answer.answerSheetUrl);
    } catch (error) {
      console.error("Error opening file:", error);
      toast.error("Failed to open file");
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleDeleteAnswerSheet = async (answerId: number) => {
    if (!db) return;

    if (!window.confirm("Are you sure you want to delete this answer sheet?")) {
      return;
    }

    try {
      await db
        .delete(examAnswersTable)
        .where(eq(examAnswersTable.id, answerId));

      setExam({
        ...exam!,
        examAnswers: exam!.examAnswers.filter((a) => a.id !== answerId),
      });

      toast.success("Answer sheet deleted successfully");
    } catch (error) {
      console.error("Error deleting answer sheet:", error);
      toast.error("Failed to delete answer sheet");
    }
  };

  useEffect(() => {
    return () => {
      cleanupBlobUrls();
    };
  }, []);

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

  const answersCount = exam.examAnswers.length;

  const createdDate =
    exam.createdAt instanceof Date
      ? format(exam.createdAt, "yyyy-MM-dd")
      : format(new Date(exam.createdAt), "yyyy-MM-dd");

  let averageScore = 0;
  let highestScore = 0;
  let lowestScore = 0;

  if (answersCount > 0) {
    const scores = exam.examAnswers.map((answer) => answer.score);
    averageScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;
    highestScore = Math.max(...scores);
    lowestScore = Math.min(...scores);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Answer Sheets Graded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {answersCount} / {answersCount}
            </div>
            <p className="text-sm text-gray-500">
              {answersCount > 0 ? "In progress" : "No submissions"}
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
            Upload Answer Sheets
          </Button>
        </Link>
        {exam?.url && (
          <Button
            variant="outline"
            disabled={downloadLoading}
            onClick={handleDownload}
          >
            {downloadLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download Test PDF
          </Button>
        )}
      </div>

      <Tabs defaultValue="details">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Test Details</TabsTrigger>
          <TabsTrigger value="rubric">Grading Rubric</TabsTrigger>
          <TabsTrigger value="answerKey">Answer Key</TabsTrigger>
          <TabsTrigger value="answerSheets">Answer Sheets</TabsTrigger>
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
                {exam?.url && (
                  <div>
                    <h3 className="font-medium">Test PDF</h3>
                    <div className="flex items-center mt-2">
                      <FileText className="h-6 w-6 text-gray-400 mr-2" />
                      <span className="text-sm">View PDF</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                        disabled={downloadLoading}
                        onClick={handleDownload}
                      >
                        {downloadLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rubric">
          <Card>
            <CardHeader>
              <CardTitle>Grading Rubric</CardTitle>
              <CardDescription>
                Criteria used for grading answer sheets
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

        <TabsContent value="answerKey">
          <Card>
            <CardHeader>
              <CardTitle>Answer Key</CardTitle>
              <CardDescription>Correct answers for this test</CardDescription>
            </CardHeader>
            <CardContent>
              {exam.answerKey ? (
                <div className="whitespace-pre-line bg-gray-50 p-4 rounded-lg text-gray-700 font-mono text-sm">
                  {exam.answerKey}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">
                    No answer key has been set for this exam.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href={`/provas/${examId}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Answer Key
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="answerSheets">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Answer Sheets</CardTitle>
                <CardDescription>
                  Manage individual answer sheets for this exam
                </CardDescription>
              </div>
              <Link href={`/answers/upload?examId=${examId}`}>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Add Answer Sheets
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {answersCount > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exam.examAnswers.map((answer) => {
                        const createdDate =
                          answer.createdAt instanceof Date
                            ? format(answer.createdAt, "yyyy-MM-dd")
                            : format(new Date(answer.createdAt), "yyyy-MM-dd");

                        return (
                          <TableRow key={answer.id}>
                            <TableCell className="font-medium">
                              {answer.name}
                            </TableCell>
                            <TableCell>{createdDate}</TableCell>
                            <TableCell>{answer.score}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  answer.feedback ? "secondary" : "default"
                                }
                              >
                                {answer.feedback ? "Graded" : "Processing"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {answer.answerSheetUrl && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleViewAnswerSheet(answer)
                                      }
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Sheet
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteAnswerSheet(answer.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                                    <span className="text-red-500">Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">
                    No answer sheets available yet
                  </p>
                  <Link href={`/answers/upload?examId=${examId}`}>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Answer Sheets
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Overview of answer sheet performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {answersCount > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Average Score</p>
                      <p className="text-2xl font-bold">
                        {averageScore.toFixed(1)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Highest Score</p>
                      <p className="text-2xl font-bold">
                        {highestScore.toFixed(1)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Lowest Score</p>
                      <p className="text-2xl font-bold">
                        {lowestScore.toFixed(1)}
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
                      Upload Answer Sheets
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
