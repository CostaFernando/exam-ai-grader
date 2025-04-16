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
import { ArrowLeft, Loader2 } from "lucide-react";
import { initializeDatabase } from "@/db";
import { eq } from "drizzle-orm";
import { examsTable } from "@/db/schema";
import { storeFileInIndexedDB } from "@/lib/indexedDB";
import { toast } from "sonner";

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

  useEffect(() => {
    async function initializeDatabaseAndSetDb() {
      try {
        const database = await initializeDatabase();
        setDb(database);
      } catch (err) {
        console.error("Failed to initialize database:", err);
        setError("Failed to connect to database");
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
          setError("Exam not found");
        } else {
          setExam(result);
        }
      } catch (err) {
        console.error("Error fetching exam:", err);
        setError("Failed to load exam data");
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
      // User cleared the file selection
      return;
    }

    try {
      // Take the first file if multiple were provided
      const file = files[0];
      setSelectedFile(file);
      const fileRef = await storeFileInIndexedDB(file);
      setExam({ ...exam, url: fileRef });
    } catch (error) {
      console.error("Error storing file:", error);
      toast.error("Failed to upload file");
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

      toast.success("Test updated successfully!");
      router.push(`/provas/${examId}`);
    } catch (err) {
      console.error("Error updating exam:", err);
      toast.error("Failed to update test");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Test</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Test Details</CardTitle>
            <CardDescription>Update your test information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="test-name">Test Name</Label>
              <Input
                id="test-name"
                value={exam.name}
                onChange={(e) => setExam({ ...exam, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
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
              <Label>Test PDF</Label>
              <FileUploader
                accept=".pdf"
                maxSize={10}
                multiple={false}
                file={selectedFile}
                onFileSelect={handleFileSelect}
              />
              <p className="text-xs text-gray-500">
                Upload a new PDF to replace the current one (optional)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rubric">Grading Rubric</Label>
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
              <Label htmlFor="answerKey">Answer Key</Label>
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
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.back()}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
