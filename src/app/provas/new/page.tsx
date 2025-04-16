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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "@/components/file-uploader";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { storeFileInIndexedDB } from "@/lib/indexedDB";
import { initializeDatabase } from "@/db";
import { examsTable } from "@/db/schema";

const formSchema = z.object({
  name: z.string().min(1, "Test name is required"),
  url: z.string().min(1, "Test PDF is required"),
  description: z.string().min(1, "Description is required"),
  gradingRubric: z.string().min(1, "Grading rubric is required"),
  answerKey: z.string().min(1, "Answer key is required"),
});

export default function CreateExamPage() {
  const router = useRouter();
  const [useAI, setUseAI] = useState(false);
  const [db, setDb] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);
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
      toast.error("Failed to upload file");
    }
  };

  async function createExamInDb(data: z.infer<typeof formSchema>) {
    if (!db) {
      throw new Error("Database not initialized");
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
      toast.success("Test created successfully!");
      router.push("/provas");
    } catch (error) {
      console.error("Error creating test:", error);
      const message =
        error instanceof Error ? error.message : "Failed to create test";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Create New Test</h1>

      <Card className="max-w-4xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Test Details</CardTitle>
              <CardDescription>
                Upload your test PDF and configure grading criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {errorMessage && (
                <div className="text-red-500 text-sm">{errorMessage}</div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Midterm Exam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Test PDF</FormLabel>
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="use-ai"
                  checked={useAI}
                  onCheckedChange={setUseAI}
                />
                <FormLabel htmlFor="use-ai">
                  Use AI to generate rubrics and answer keys
                </FormLabel>
              </div>

              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Manual Configuration</TabsTrigger>
                  <TabsTrigger value="ai" disabled={!useAI}>
                    AI Generated
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter a brief description of the test"
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
                        <FormLabel>Grading Rubric</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your grading criteria here. For example:
- Question 1 (10 points): Complete explanation of concept X
- Question 2 (15 points): Correct application of formula Y"
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
                        <FormLabel>Answer Key</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the correct answers for each question here."
                            rows={6}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="ai" className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">
                      The AI will analyze your test PDF and generate appropriate
                      rubrics and answer keys. You will be able to review and
                      edit them before finalizing.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => router.back()}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Create Test"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
