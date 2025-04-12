"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "@/components/file-uploader";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

export default function NewTest() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [useAI, setUseAI] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push("/tests");
    }, 2000);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Create New Test</h1>

      <Card className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Test Details</CardTitle>
            <CardDescription>
              Upload your test PDF and configure grading criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="test-name">Test Name</Label>
              <Input id="test-name" placeholder="Midterm Exam" required />
            </div>

            <div className="space-y-2">
              <Label>Test PDF</Label>
              <FileUploader
                accept=".pdf"
                maxSize={10}
                onFileSelect={(file) => console.log(file)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="use-ai" checked={useAI} onCheckedChange={setUseAI} />
              <Label htmlFor="use-ai">
                Use AI to generate rubrics and answer keys
              </Label>
            </div>

            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual Configuration</TabsTrigger>
                <TabsTrigger value="ai" disabled={!useAI}>
                  AI Generated
                </TabsTrigger>
              </TabsList>
              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question-count">Number of Questions</Label>
                  <Input
                    id="question-count"
                    type="number"
                    min="1"
                    placeholder="5"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rubric">Grading Rubric</Label>
                  <Textarea
                    id="rubric"
                    placeholder="Enter your grading criteria here. For example:
- Question 1 (10 points): Complete explanation of concept X
- Question 2 (15 points): Correct application of formula Y"
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="answer-key">Answer Key</Label>
                  <Textarea
                    id="answer-key"
                    placeholder="Enter the correct answers for each question here."
                    rows={6}
                    required
                  />
                </div>
              </TabsContent>
              <TabsContent value="ai" className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500">
                    The AI will analyze your test PDF and generate appropriate
                    rubrics and answer keys. You will be able to review and edit
                    them before finalizing.
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
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
      </Card>
    </div>
  );
}
