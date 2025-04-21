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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { openFileFromReference } from "@/lib/indexedDB";
import { toast } from "sonner";

type ExamAnswer = {
  id: number;
  name: string;
  examId: number;
  score: number | null;
  feedback: string | null;
  answerSheetUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

interface ResultsTableProps {
  examId?: string | number;
}

export function ResultsTable({ examId }: ResultsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<ExamAnswer | null>(null);
  const [viewingSheetLoading, setViewingSheetLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const db = await initializeDatabase();

        let query;
        if (examId) {
          query = db.query.examAnswersTable.findMany({
            where: eq(examAnswersTable.examId, Number(examId)),
          });
        } else {
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
        setError("Falha ao carregar dados");
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

  const openFeedbackModal = (answer: ExamAnswer) => {
    setSelectedAnswer(answer);
  };

  const closeFeedbackModal = () => {
    setSelectedAnswer(null);
  };

  const handleViewAnswerSheet = async (answerSheetUrl: string | null) => {
    if (!answerSheetUrl) return;

    try {
      setViewingSheetLoading(true);
      await openFileFromReference(answerSheetUrl);
    } catch (error) {
      console.error("Error opening file:", error);
      toast.error("Falha ao abrir o arquivo");
    } finally {
      setViewingSheetLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Carregando resultados...</span>
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
            placeholder="Buscar alunos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm">
          Filtrar
        </Button>
      </div>

      {filteredAnswers.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">
            {searchTerm
              ? "Nenhum aluno correspondente encontrado"
              : "Nenhuma folha de resposta disponível ainda"}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Nota</TableHead>
                <TableHead className="text-right">Feedback</TableHead>
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
                          ? "Concluído"
                          : status === "in-progress"
                          ? "Em Andamento"
                          : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {status === "pending" ? "-" : answer.score || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openFeedbackModal(answer)}
                        disabled={status === "pending"}
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

      {/* Feedback Modal */}
      <Dialog
        open={!!selectedAnswer}
        onOpenChange={(open) => {
          if (!open) closeFeedbackModal();
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">Feedback do Aluno</DialogTitle>
            <DialogDescription className="text-base">
              {selectedAnswer?.name} - Nota: {selectedAnswer?.score || 0}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <h3 className="font-medium text-lg mb-2">Feedback:</h3>
            {selectedAnswer?.feedback ? (
              <div className="bg-muted p-6 rounded-md whitespace-pre-wrap max-h-[50vh] overflow-y-auto text-base leading-relaxed">
                {selectedAnswer.feedback}
              </div>
            ) : (
              <p className="text-gray-500 italic text-base">
                Nenhum feedback disponível ainda.
              </p>
            )}
          </div>

          {selectedAnswer?.answerSheetUrl && (
            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full text-base py-5"
                onClick={() =>
                  handleViewAnswerSheet(selectedAnswer.answerSheetUrl)
                }
                disabled={viewingSheetLoading}
              >
                {viewingSheetLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Ver Folha de Resposta Original
              </Button>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              onClick={closeFeedbackModal}
              size="lg"
              className="text-base px-8"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
