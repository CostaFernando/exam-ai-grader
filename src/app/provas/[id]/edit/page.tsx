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
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "@/components/file-uploader";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";

// Mock data for a specific test
const mockTest = {
  id: "1",
  name: "Midterm Exam",
  description: "Midterm examination covering chapters 1-5 of the textbook.",
  questions: [
    {
      id: 1,
      text: "Explain the concept of inheritance in object-oriented programming.",
      maxScore: 10,
    },
    {
      id: 2,
      text: "Compare and contrast functional and object-oriented programming paradigms.",
      maxScore: 15,
    },
    {
      id: 3,
      text: "Describe the principles of REST architecture and provide examples.",
      maxScore: 20,
    },
    {
      id: 4,
      text: "Analyze the time complexity of the quicksort algorithm.",
      maxScore: 25,
    },
    {
      id: 5,
      text: "Design a database schema for a social media application.",
      maxScore: 30,
    },
  ],
  rubric: `
    Question 1 (10 points):
    - Complete explanation of inheritance (5 points)
    - Examples of inheritance in practice (3 points)
    - Discussion of benefits and limitations (2 points)

    Question 2 (15 points):
    - Clear explanation of both paradigms (5 points)
    - Detailed comparison of key differences (5 points)
    - Examples demonstrating the differences (5 points)

    Question 3 (20 points):
    - Explanation of REST principles (8 points)
    - Discussion of RESTful API design (6 points)
    - Practical examples of REST APIs (6 points)

    Question 4 (25 points):
    - Correct analysis of average case (10 points)
    - Analysis of worst case scenario (8 points)
    - Comparison with other sorting algorithms (7 points)

    Question 5 (30 points):
    - Entity relationship diagram (10 points)
    - Normalization and optimization (10 points)
    - Explanation of design decisions (10 points)
  `,
};

export default function EditTestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const testId = params.id;

  // In a real application, you would fetch the test data based on the ID
  const [test, setTest] = useState(mockTest);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuestionChange = (
    id: number,
    field: string,
    value: string | number
  ) => {
    setTest({
      ...test,
      questions: test.questions.map((q) =>
        q.id === id
          ? { ...q, [field]: field === "maxScore" ? Number(value) : value }
          : q
      ),
    });
  };

  const handleAddQuestion = () => {
    const newId = Math.max(...test.questions.map((q) => q.id)) + 1;
    setTest({
      ...test,
      questions: [...test.questions, { id: newId, text: "", maxScore: 10 }],
    });
  };

  const handleRemoveQuestion = (id: number) => {
    setTest({
      ...test,
      questions: test.questions.filter((q) => q.id !== id),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push(`/provas/${testId}`);
    }, 1500);
  };

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
            <CardDescription>
              Update your test information and questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="test-name">Test Name</Label>
              <Input
                id="test-name"
                value={test.name}
                onChange={(e) => setTest({ ...test, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={test.description}
                onChange={(e) =>
                  setTest({ ...test, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Test PDF</Label>
              <FileUploader
                accept=".pdf"
                maxSize={10}
                onFileSelect={(file) => console.log(file)}
              />
              <p className="text-xs text-gray-500">
                Upload a new PDF to replace the current one (optional)
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Questions</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddQuestion}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Question
                </Button>
              </div>

              <div className="space-y-4">
                {test.questions.map((question) => (
                  <div
                    key={question.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Label>Question {question.id}</Label>
                      {test.questions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`question-${question.id}-text`}>
                        Question Text
                      </Label>
                      <Textarea
                        id={`question-${question.id}-text`}
                        value={question.text}
                        onChange={(e) =>
                          handleQuestionChange(
                            question.id,
                            "text",
                            e.target.value
                          )
                        }
                        rows={2}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`question-${question.id}-score`}>
                        Maximum Score
                      </Label>
                      <Input
                        id={`question-${question.id}-score`}
                        type="number"
                        min="1"
                        value={question.maxScore}
                        onChange={(e) =>
                          handleQuestionChange(
                            question.id,
                            "maxScore",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rubric">Grading Rubric</Label>
              <Textarea
                id="rubric"
                value={test.rubric}
                onChange={(e) => setTest({ ...test, rubric: e.target.value })}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
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
