"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Edit,
  Eye,
  Loader2,
} from "lucide-react";
import { initializeDatabase } from "@/db";
import { examStatusEnum, examsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { format } from "date-fns";

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

export default function ExamsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [db, setDb] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    async function fetchExams() {
      if (!db) return;

      try {
        setLoading(true);
        const result = await db.query.examsTable.findMany({
          with: {
            examAnswers: {
              with: {
                student: true,
              },
            },
          },
        });
        setExams(result);
      } catch (err) {
        console.error("Error fetching exams:", err);
        setError("Failed to load exams");
      } finally {
        setLoading(false);
      }
    }

    if (db) {
      fetchExams();
    }
  }, [db]);

  const filteredExams = exams.filter((exam) =>
    exam.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteExam = async (id: number) => {
    if (!db) return;

    try {
      await db.delete(examsTable).where(eq(examsTable.id, id));
      setExams(exams.filter((exam) => exam.id !== id));
    } catch (err) {
      console.error("Error deleting exam:", err);
    }
  };

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

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Provas</h1>
        <Link href="/provas/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Test
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas Provas</CardTitle>
          <CardDescription>
            Manage your created tests and their grading status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search tests..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Filter</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Todas Provas</DropdownMenuItem>
                <DropdownMenuItem>Active</DropdownMenuItem>
                <DropdownMenuItem>Completed</DropdownMenuItem>
                <DropdownMenuItem>Archived</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">Loading exams...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium">No tests found</h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchTerm
                  ? "Try a different search term"
                  : "Create your first test to get started"}
              </p>
              {!searchTerm && (
                <Link href="/provas/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Test
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Students Graded</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.map((exam) => {
                    const uniqueStudentIds = new Set(
                      exam.examAnswers.map((answer) => answer.studentId)
                    );
                    const studentsGraded = uniqueStudentIds.size;

                    const createdDate =
                      exam.createdAt instanceof Date
                        ? format(exam.createdAt, "yyyy-MM-dd")
                        : format(new Date(exam.createdAt), "yyyy-MM-dd");

                    return (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">
                          {exam.name}
                        </TableCell>
                        <TableCell>{createdDate}</TableCell>
                        <TableCell>
                          {studentsGraded} / {studentsGraded}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(exam.status)}>
                            {formatStatus(exam.status)}
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
                              <Link href={`/provas/${exam.id}`}>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/provas/${exam.id}/edit`}>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Test
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/answers/upload?testId=${exam.id}`}>
                                <DropdownMenuItem>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Student Answers
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem
                                onClick={() => handleDeleteExam(exam.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
