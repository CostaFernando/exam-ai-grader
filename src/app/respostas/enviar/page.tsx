"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploader } from "@/components/file-uploader";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { storeFileInIndexedDB } from "@/lib/indexedDB";
import { initializeDatabase, type DbInstance } from "@/db";
import { examAnswersTable, examsTable } from "@/db/schema";
import { toast } from "sonner";

interface AnswerSheet {
  id: string;
  name: string;
  file: File | null;
  fileUrl: string | null;
}

type Exam = typeof examsTable.$inferSelect;

export default function UploadAnswersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examIdParam = searchParams.get("examId");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState(examIdParam || "");
  const [answerSheets, setAnswerSheets] = useState<AnswerSheet[]>([
    {
      id: Date.now().toString(),
      name: "",
      file: null,
      fileUrl: null,
    },
  ]);
  const [db, setDb] = useState<DbInstance | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    async function initializeDatabaseAndLoadExams() {
      const db = await initializeDatabase();
      setDb(db);

      const loadedExams = await db.query.examsTable.findMany();
      setExams(loadedExams);
    }

    initializeDatabaseAndLoadExams();
  }, []);

  useEffect(() => {
    if (examIdParam) {
      setSelectedExam(examIdParam);
    }
  }, [examIdParam]);

  const handleAddAnswerSheet = () => {
    setAnswerSheets([
      {
        id: Date.now().toString(),
        name: "",
        file: null,
        fileUrl: null,
      },
      ...answerSheets,
    ]);
  };

  const handleRemoveAnswerSheet = (id: string) => {
    setAnswerSheets(answerSheets.filter((sheet) => sheet.id !== id));
  };

  const handleFileSelect = async (id: string, files: File[]) => {
    if (files.length === 0) {
      setAnswerSheets(
        answerSheets.map((sheet) =>
          sheet.id === id
            ? {
                ...sheet,
                file: null,
                fileUrl: null,
              }
            : sheet
        )
      );
      return;
    }

    try {
      const currentIndex = answerSheets.findIndex((sheet) => sheet.id === id);
      if (currentIndex === -1) return;

      const updatedSheets = [...answerSheets];

      const firstFile = files[0];
      const firstFileUrl = await storeFileInIndexedDB(firstFile);

      updatedSheets[currentIndex] = {
        ...updatedSheets[currentIndex],
        file: firstFile,
        fileUrl: firstFileUrl,
        name:
          updatedSheets[currentIndex].name ||
          firstFile.name.replace(/\.[^/.]+$/, ""),
      };

      if (files.length > 1) {
        let nextEmptySheetIndex = -1;
        const newSheets: AnswerSheet[] = [];

        for (let i = currentIndex + 1; i < updatedSheets.length; i++) {
          if (!updatedSheets[i].file) {
            nextEmptySheetIndex = i;
            break;
          }
        }

        for (let i = 1; i < files.length; i++) {
          const file = files[i];
          const fileUrl = await storeFileInIndexedDB(file);

          if (nextEmptySheetIndex !== -1) {
            updatedSheets[nextEmptySheetIndex] = {
              ...updatedSheets[nextEmptySheetIndex],
              file,
              fileUrl,
              name:
                updatedSheets[nextEmptySheetIndex].name ||
                file.name.replace(/\.[^/.]+$/, ""),
            };

            nextEmptySheetIndex = -1;
            for (
              let j = nextEmptySheetIndex + 1;
              j < updatedSheets.length;
              j++
            ) {
              if (!updatedSheets[j].file) {
                nextEmptySheetIndex = j;
                break;
              }
            }
          } else {
            newSheets.push({
              id: Date.now().toString() + i,
              name: file.name.replace(/\.[^/.]+$/, ""),
              file,
              fileUrl,
            });
          }
        }

        if (newSheets.length > 0) {
          setAnswerSheets([...newSheets, ...updatedSheets]);
          return;
        }
      }

      setAnswerSheets(updatedSheets);
    } catch (error) {
      console.error("Error storing files:", error);
      toast.error("Falha ao enviar arquivos");
    }
  };

  const handleNameChange = (id: string, name: string) => {
    setAnswerSheets(
      answerSheets.map((sheet) =>
        sheet.id === id ? { ...sheet, name } : sheet
      )
    );
  };

  const saveAnswerSheetsToDb = async () => {
    if (!db) throw new Error("Database not initialized");

    const examId = Number.parseInt(selectedExam);

    const savedSheets = await Promise.all(
      answerSheets.map(async (sheet) => {
        if (!sheet.fileUrl) throw new Error("URL do arquivo está faltando");

        const result = await db
          .insert(examAnswersTable)
          .values({
            name: sheet.name,
            examId: examId,
            answerSheetUrl: sheet.fileUrl,
          })
          .returning();

        return result;
      })
    );

    return savedSheets;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await saveAnswerSheetsToDb();
      toast.success("Folhas de resposta enviadas com sucesso!");
      router.push(`/provas/${selectedExam}`);
    } catch (error) {
      console.error("Error saving answer sheets:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Falha ao salvar folhas de resposta";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Enviar Folhas de Resposta</h1>

      <Card className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Folhas de Resposta da Prova</CardTitle>
            <CardDescription>
              Envie arquivos PDF contendo as respostas para correção
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="exam-select">Selecionar Prova</Label>
              <Select
                key={selectedExam}
                value={selectedExam}
                onValueChange={setSelectedExam}
                required
                disabled={!!examIdParam}
              >
                <SelectTrigger id="exam-select">
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
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Folhas de Resposta</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAnswerSheet}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Folha de Resposta
                </Button>
              </div>

              <div className="space-y-4">
                {answerSheets.map((sheet) => (
                  <div
                    key={sheet.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        className="border-none bg-transparent p-0 focus:outline-none focus:ring-0 font-semibold w-full"
                        value={sheet.name}
                        onChange={(e) =>
                          handleNameChange(sheet.id, e.target.value)
                        }
                        placeholder="Digite o nome (ou deixe em branco para usar o nome do arquivo)"
                      />
                      {answerSheets.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAnswerSheet(sheet.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    <FileUploader
                      accept=".pdf"
                      maxSize={10}
                      multiple={true}
                      file={sheet.file}
                      onFileSelect={(files) =>
                        handleFileSelect(sheet.id, files)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.back()}
              type="button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !selectedExam ||
                answerSheets.some((sheet) => !sheet.fileUrl) ||
                answerSheets.some((sheet) => !sheet.name)
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando
                </>
              ) : (
                "Enviar Folhas de Resposta"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
