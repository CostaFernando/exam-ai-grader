"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Loader2 } from "lucide-react";
import { initializeDatabase } from "@/db";
import { eq } from "drizzle-orm";
import { examsTable, examAnswersTable } from "@/db/schema";

type ExamAnswer = {
  id: number;
  name: string;
  examId: number;
  score: number | null;
  feedback: string | null;
  answerSheetUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

interface ResultsTableProps {
  examId?: string | number;
}

export function ResultsTable({ examId }: ResultsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const db = await initializeDatabase();

        let query;
        if (examId) {
          // Query for specific exam
          query = db.query.examAnswersTable.findMany({
            where: eq(examAnswersTable.examId, Number(examId)),
          });
        } else {
          // Query all answers, with their exams
          query = db.query.examAnswersTable.findMany({
            with: {
              exam: true,
            },
          });
        }

        const result = await query;
        setAnswers(result);
      } catch (err) {
        console.error("Error fetching exam answers:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [examId]);

  const filteredAnswers = answers.filter((answer) =>
    answer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatus = (answer: ExamAnswer) => {
    if (!answer.score && !answer.feedback) return "pending";
    if (answer.score && answer.feedback) return "completed";
    return "in-progress";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading results...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search students..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm">
          Filter
        </Button>
      </div>

      {filteredAnswers.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">
            {searchTerm
              ? "No matching students found"
              : "No answer sheets available yet"}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnswers.map((answer) => {
                const status = getStatus(answer);

                return (
                  <TableRow key={answer.id}>
                    <TableCell className="font-medium">{answer.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          status === "completed"
                            ? "default"
                            : status === "in-progress"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {status === "completed"
                          ? "Completed"
                          : status === "in-progress"
                          ? "In Progress"
                          : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {status === "pending" ? "-" : `${answer.score || 0}/100`}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // View feedback or answer details
                          // This could open a modal or navigate to a details page
                        }}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
