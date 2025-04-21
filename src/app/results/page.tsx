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
import { ResultsTable } from "@/app/results/_components/results-table";
import { ResultsChart } from "@/app/results/_components/results-chart";
import { initializeDatabase } from "@/db";
import { examsTable, examAnswersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
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

type Exam = {
  id: number;
  name: string;
  maxScore?: number;
};

type ExamAnswer = {
  id: number;
  examId: number;
  name: string;
  score: number | null;
  feedback: string | null;
  answerSheetUrl?: string;
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
  const [loading, setLoading] = useState(false);
  const [fetchingExams, setFetchingExams] = useState(true);
  const [error, setError] = useState("");
  const [averageScore, setAverageScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<ExamAnswer | null>(null);
  const [viewingSheetLoading, setViewingSheetLoading] = useState(false);

  useEffect(() => {
    async function fetchExams() {
      try {
        setFetchingExams(true);
        const db = await initializeDatabase();
        const result = await db.query.examsTable.findMany();
        setExams(result);

        if (paramExamId && !selectedExam) {
          setSelectedExam(paramExamId);
        }
      } catch (err) {
        console.error("Error fetching exams:", err);
        setError("Falha ao carregar provas");
      } finally {
        setFetchingExams(false);
      }
    }

    fetchExams();
  }, [paramExamId, selectedExam]);

  useEffect(() => {
    async function fetchAnswers() {
      if (!selectedExam) return;

      try {
        setLoading(true);
        const db = await initializeDatabase();
        const examId = Number(selectedExam);

        const exam = await db.query.examsTable.findFirst({
          where: eq(examsTable.id, examId),
        });

        const result = await db.query.examAnswersTable.findMany({
          where: eq(examAnswersTable.examId, examId),
        });

        setAnswers(result);

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

        if (completed > 0) {
          const totalScore = result.reduce(
            (sum, answer) => sum + (answer.score || 0),
            0
          );
          setAverageScore(Number((totalScore / completed).toFixed(2)));
        } else {
          setAverageScore(0);
        }
      } catch (err) {
        console.error("Error fetching answers:", err);
        setError("Falha ao carregar dados das respostas");
      } finally {
        setLoading(false);
      }
    }

    fetchAnswers();
  }, [selectedExam]);

  const openFeedbackModal = (answer: ExamAnswer) => {
    setSelectedAnswer(answer);
  };

  const closeFeedbackModal = () => {
    setSelectedAnswer(null);
  };

  const handleExport = () => {
    const headers = ["Aluno", "Nota", "Feedback"];
    const rows = answers.map((answer) => [
      answer.name,
      answer.score ?? "",
      answer.feedback ?? "",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((item) => '"' + String(item).replace(/"/g, '""') + '"')
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "resultados-" + selectedExam + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleViewAnswerSheet = async (answerSheetUrl: string | undefined) => {
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

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Resultados da Correção</h1>
        <div className="flex items-center gap-2">
          <Select value={selectedExam} onValueChange={setSelectedExam}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione uma prova" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id.toString()}>
                  {exam.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={answers.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {fetchingExams ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Carregando provas...</span>
        </div>
      ) : error ? (
        <div className="py-10 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      ) : !selectedExam ? (
        <div className="text-center py-20">
          <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-xl text-gray-500">
            Por favor, selecione uma prova para ver os resultados
          </p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Carregando resultados...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Status da Correção
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
                      {gradingStatus.pending > 0 ? "Em Andamento" : "Concluído"}
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
                      <p className="text-gray-500">Concluído</p>
                      <p className="font-bold">{gradingStatus.completed}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Em Andamento</p>
                      <p className="font-bold">{gradingStatus.inProgress}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pendente</p>
                      <p className="font-bold">{gradingStatus.pending}</p>
                    </div>
                  </div>
                  {gradingStatus.pending > 0 && (
                    <Button variant="outline" size="sm" className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Atualizar Status
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Nota Média
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-5xl font-bold">{averageScore}</div>
                  <p className="text-sm text-gray-500 mt-2">Média da Turma</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Distribuição de Notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <ResultsChart answers={answers} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="table">
            <TabsList className="mb-4">
              <TabsTrigger value="table">Visão em Tabela</TabsTrigger>
              <TabsTrigger value="individual">
                Resultados Individuais
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table">
              <Card>
                <CardHeader>
                  <CardTitle>Resultados dos Alunos</CardTitle>
                  <CardDescription>
                    Resultados completos da correção para{" "}
                    {exams.find((e) => e.id.toString() === selectedExam)
                      ?.name || "prova selecionada"}
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
                        <Badge>
                          {answer.score !== null ? answer.score : "-"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-500">Status:</div>
                          <div>
                            {answer.score && answer.feedback
                              ? "Concluído"
                              : answer.score || answer.feedback
                              ? "Em Andamento"
                              : "Pendente"}
                          </div>

                          <div className="text-gray-500">Nota:</div>
                          <div>
                            {answer.score !== null ? answer.score : "-"}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => openFeedbackModal(answer)}
                          disabled={!answer.feedback && !answer.score}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Ver Feedback
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {answers.length === 0 && (
                  <div className="col-span-3 text-center py-10">
                    <p className="text-gray-500">
                      Nenhuma folha de resposta disponível para esta prova
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

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
                    onClick={() =>
                      handleViewAnswerSheet(selectedAnswer.answerSheetUrl)
                    }
                    disabled={viewingSheetLoading}
                    className="w-full text-base py-5"
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
        </>
      )}
    </div>
  );
}
