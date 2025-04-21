"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "@/components/file-uploader";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { initializeDatabase } from "@/db";
import { eq } from "drizzle-orm";
import { examsTable } from "@/db/schema";
import { storeFileInIndexedDB } from "@/lib/indexedDB";
import { toast } from "sonner";
import { generateAssessmentRubric } from "@/server/actions/ai-assistant/assessment-rubric-generator/assessment-rubric-generator-actions";
import { generateAnswerKey } from "@/server/actions/ai-assistant/answer-key-generator/answer-key-generator-actions";

type Exam = {
  id: number;
  name: string;
  description: string | null;
  gradingRubric: string | null;
  url: string | null;
  answerKey: string | null;
};

export default function EditExamPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const examId = parseInt(params.id);

  const [exam, setExam] = useState<Exam | null>(null);
  const [db, setDb] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGeneratingRubric, setIsGeneratingRubric] = useState(false);
  const [isGeneratingAnswerKey, setIsGeneratingAnswerKey] = useState(false);

  useEffect(() => {
    async function initializeDatabaseAndSetDb() {
      try {
        const database = await initializeDatabase();
        setDb(database);
      } catch (err) {
        console.error("Failed to initialize database:", err);
        setError("Falha ao conectar ao banco de dados");
        setIsLoading(false);
      }
    }

    initializeDatabaseAndSetDb();
  }, []);

  useEffect(() => {
    async function fetchExam() {
      if (!db || isNaN(examId)) return;

      try {
        setIsLoading(true);
        const result = await db.query.examsTable.findFirst({
          where: eq(examsTable.id, examId),
        });

        if (!result) {
          setError("Prova não encontrada");
        } else {
          setExam(result);
        }
      } catch (err) {
        console.error("Error fetching exam:", err);
        setError("Falha ao carregar dados da prova");
      } finally {
        setIsLoading(false);
      }
    }

    if (db && examId) {
      fetchExam();
    }
  }, [db, examId]);

  const handleFileSelect = async (files: File[]) => {
    if (!exam) return;

    if (files.length === 0) {
      setSelectedFile(null);
      return;
    }

    try {
      const file = files[0];
      setSelectedFile(file);
      const fileRef = await storeFileInIndexedDB(file);
      setExam({ ...exam, url: fileRef });
    } catch (error) {
      console.error("Error storing file:", error);
      toast.error("Falha ao fazer upload do arquivo");
    }
  };

  const handleGenerateRubric = async () => {
    if (!selectedFile) {
      toast.error("Por favor, faça upload do PDF da prova primeiro");
      return;
    }

    setIsGeneratingRubric(true);
    try {
      const rubric = await generateAssessmentRubric(selectedFile);
      setExam({ ...exam!, gradingRubric: rubric });
      toast.success("Critérios de avaliação gerados com sucesso!");
    } catch (error) {
      console.error("Error generating rubric:", error);
      toast.error("Falha ao gerar critérios de avaliação");
    } finally {
      setIsGeneratingRubric(false);
    }
  };

  const handleGenerateAnswerKey = async () => {
    if (!selectedFile) {
      toast.error("Por favor, faça upload do PDF da prova primeiro");
      return;
    }

    setIsGeneratingAnswerKey(true);
    try {
      const answerKeyText = await generateAnswerKey(selectedFile);
      setExam({ ...exam!, answerKey: answerKeyText });
      toast.success("Gabarito gerado com sucesso!");
    } catch (error) {
      console.error("Error generating answer key:", error);
      toast.error("Falha ao gerar gabarito");
    } finally {
      setIsGeneratingAnswerKey(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam || !db) return;

    try {
      setIsSaving(true);

      await db
        .update(examsTable)
        .set({
          name: exam.name,
          description: exam.description,
          gradingRubric: exam.gradingRubric,
          url: exam.url,
          answerKey: exam.answerKey,
          updatedAt: new Date(),
        })
        .where(eq(examsTable.id, examId));

      toast.success("Prova atualizada com sucesso!");
      router.push(`/exams/${examId}`);
    } catch (err) {
      console.error("Error updating exam:", err);
      toast.error("Falha ao atualizar prova");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500">Carregando detalhes da prova...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.back()}>Voltar</Button>
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
            Voltar
          </Button>
        </div>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Prova Não Encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <p>A prova solicitada não pôde ser encontrada.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/exams")}>
              Ver Todos os Testes
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">Editar Prova</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Detalhes da Prova</CardTitle>
            <CardDescription>
              Atualize as informações da sua prova
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="exam-name">Nome da Prova</Label>
              <Input
                id="exam-name"
                value={exam.name}
                onChange={(e) => setExam({ ...exam, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={exam.description || ""}
                onChange={(e) =>
                  setExam({ ...exam, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>PDF da Prova</Label>
              <FileUploader
                accept=".pdf"
                maxSize={10}
                multiple={false}
                file={selectedFile}
                onFileSelect={handleFileSelect}
              />
              <p className="text-xs text-gray-500">
                Faça upload de um novo PDF para substituir o atual (opcional)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="rubric">Critérios de Avaliação</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateRubric}
                  disabled={isGeneratingRubric || !selectedFile}
                >
                  {isGeneratingRubric ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Gerar com IA
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="rubric"
                value={exam.gradingRubric || ""}
                onChange={(e) =>
                  setExam({ ...exam, gradingRubric: e.target.value })
                }
                rows={10}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="answerKey">Gabarito</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateAnswerKey}
                  disabled={isGeneratingAnswerKey || !selectedFile}
                >
                  {isGeneratingAnswerKey ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Gerar com IA
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="answerKey"
                value={exam.answerKey || ""}
                onChange={(e) =>
                  setExam({ ...exam, answerKey: e.target.value })
                }
                rows={10}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="pt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.back()}
              type="button"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
