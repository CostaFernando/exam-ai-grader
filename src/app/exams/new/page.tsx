"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "@/components/file-uploader";
import { Loader2, Sparkles } from "lucide-react";
import { storeFileInIndexedDB } from "@/lib/indexedDB";
import { initializeDatabase } from "@/db";
import { examsTable } from "@/db/schema";
import { generateAssessmentRubric } from "@/server/actions/ai-assistant/assessment-rubric-generator/assessment-rubric-generator-actions";
import { generateAnswerKey } from "@/server/actions/ai-assistant/answer-key-generator/answer-key-generator-actions";

const formSchema = z.object({
  name: z.string().min(1, "Nome da prova é obrigatório"),
  url: z.string().min(1, "PDF da prova é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  gradingRubric: z.string().min(1, "Critérios de correção são obrigatórios"),
  answerKey: z.string().min(1, "Gabarito é obrigatório"),
});

export default function CreateExamPage() {
  const router = useRouter();
  const [db, setDb] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);
  const [isGeneratingRubric, setIsGeneratingRubric] = useState(false);
  const [isGeneratingAnswerKey, setIsGeneratingAnswerKey] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
      gradingRubric: "",
      answerKey: "",
    },
  });

  useEffect(() => {
    async function initializeDatabaseAndSetDb() {
      const database = await initializeDatabase();
      setDb(database);
    }

    initializeDatabaseAndSetDb();
  }, []);

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) {
      form.setValue("url", "");
      setSelectedFile(null);
      return;
    }

    try {
      const file = files[0];
      setSelectedFile(file);
      const fileRef = await storeFileInIndexedDB(file);
      form.setValue("url", fileRef);
    } catch (error) {
      console.error("Error storing file:", error);
      toast.error("Falha ao enviar arquivo");
    }
  };

  const handleGenerateRubric = async () => {
    if (!selectedFile) {
      toast.error("Por favor, envie o PDF da prova primeiro");
      return;
    }

    setIsGeneratingRubric(true);
    try {
      const rubric = await generateAssessmentRubric(selectedFile);
      form.setValue("gradingRubric", rubric);
      toast.success("Critérios de correção gerados com sucesso!");
    } catch (error) {
      console.error("Error generating rubric:", error);
      toast.error("Falha ao gerar critérios de correção");
    } finally {
      setIsGeneratingRubric(false);
    }
  };

  const handleGenerateAnswerKey = async () => {
    if (!selectedFile) {
      toast.error("Por favor, envie o PDF da prova primeiro");
      return;
    }

    setIsGeneratingAnswerKey(true);
    try {
      const answerKeyText = await generateAnswerKey(selectedFile);
      form.setValue("answerKey", answerKeyText);
      toast.success("Gabarito gerado com sucesso!");
    } catch (error) {
      console.error("Error generating answer key:", error);
      toast.error("Falha ao gerar gabarito");
    } finally {
      setIsGeneratingAnswerKey(false);
    }
  };

  async function createExamInDb(data: z.infer<typeof formSchema>) {
    if (!db) {
      throw new Error("Banco de dados não inicializado");
    }

    const exam = await db
      .insert(examsTable)
      .values({
        name: data.name,
        description: data.description,
        gradingRubric: data.gradingRubric,
        answerKey: data.answerKey,
        url: data.url,
        status: "IN_PROGRESS",
      })
      .returning();

    return exam;
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    setErrorMessage("");

    try {
      await createExamInDb(data);
      toast.success("Prova criada com sucesso!");
      router.push("/exams");
    } catch (error) {
      console.error("Error creating test:", error);
      const message =
        error instanceof Error ? error.message : "Falha ao criar prova";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Criar Nova Prova</h1>

      <Card className="max-w-4xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Detalhes da Prova</CardTitle>
              <CardDescription>
                Envie o PDF da sua prova e configure os critérios de correção
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-6 space-y-6">
              {errorMessage && (
                <div className="text-red-500 text-sm">{errorMessage}</div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Prova</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da Prova" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>PDF da Prova</FormLabel>
                <FileUploader
                  accept=".pdf"
                  maxSize={10}
                  multiple={false}
                  file={selectedFile}
                  onFileSelect={handleFileSelect}
                />
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input type="hidden" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Insira uma breve descrição da prova"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gradingRubric"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Critérios de Correção</FormLabel>
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
                    <FormControl>
                      <Textarea
                        placeholder="Insira seus critérios de correção aqui. Por exemplo:
- Questão 1 (10 pontos): Explicação completa do conceito X
- Questão 2 (15 pontos): Aplicação correta da fórmula Y"
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="answerKey"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Gabarito</FormLabel>
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
                    <FormControl>
                      <Textarea
                        placeholder="Insira as respostas corretas para cada questão aqui."
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={() => router.back()}
                type="button"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando
                  </>
                ) : (
                  "Criar Prova"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
