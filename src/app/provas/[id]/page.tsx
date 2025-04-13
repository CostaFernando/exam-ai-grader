"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Edit, FileText, Upload } from "lucide-react";

// Mock data for a specific test
const mockTest = {
  id: "1",
  name: "Midterm Exam",
  createdAt: "2025-03-15",
  questionCount: 5,
  studentsGraded: 18,
  totalStudents: 25,
  status: "active",
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

export default function TestDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const testId = params.id;

  // In a real application, you would fetch the test data based on the ID
  const test = mockTest;

  if (!test) {
    return <div>Test not found</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{test.name}</h1>
        <Badge
          variant={
            test.status === "active"
              ? "default"
              : test.status === "completed"
              ? "secondary"
              : "outline"
          }
        >
          {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{test.questionCount}</div>
            <p className="text-sm text-gray-500">Total questions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Students Graded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {test.studentsGraded} / {test.totalStudents}
            </div>
            <p className="text-sm text-gray-500">
              {test.studentsGraded === test.totalStudents
                ? "All complete"
                : "In progress"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{test.createdAt}</div>
            <p className="text-sm text-gray-500">Date created</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <Link href={`/provas/${testId}/edit`}>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Test
          </Button>
        </Link>
        <Link href={`/answers/upload?testId=${testId}`}>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Student Answers
          </Button>
        </Link>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Test PDF
        </Button>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Test Details</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="rubric">Grading Rubric</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Test Information</CardTitle>
              <CardDescription>Details about this test</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-gray-600">{test.description}</p>
                </div>
                <div>
                  <h3 className="font-medium">Total Points</h3>
                  <p className="text-gray-600">
                    {test.questions.reduce((sum, q) => sum + q.maxScore, 0)}{" "}
                    points
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Test PDF</h3>
                  <div className="flex items-center mt-2">
                    <FileText className="h-6 w-6 text-gray-400 mr-2" />
                    <span className="text-sm">midterm_exam.pdf</span>
                    <Button variant="ghost" size="sm" className="ml-2">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <CardTitle>Test Questions</CardTitle>
              <CardDescription>Questions included in this test</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {test.questions.map((question) => (
                  <div key={question.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">Question {question.id}</h3>
                      <Badge variant="outline">
                        {question.maxScore} points
                      </Badge>
                    </div>
                    <p className="text-gray-600">{question.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rubric">
          <Card>
            <CardHeader>
              <CardTitle>Grading Rubric</CardTitle>
              <CardDescription>
                Criteria used for grading student answers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line bg-gray-50 p-4 rounded-lg text-gray-700 font-mono text-sm">
                {test.rubric}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Rubric
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>Overview of student performance</CardDescription>
            </CardHeader>
            <CardContent>
              {test.studentsGraded > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Average Score</p>
                      <p className="text-2xl font-bold">78%</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Highest Score</p>
                      <p className="text-2xl font-bold">95%</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Lowest Score</p>
                      <p className="text-2xl font-bold">62%</p>
                    </div>
                  </div>

                  <Link href={`/results?testId=${testId}`}>
                    <Button className="w-full">View Detailed Results</Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">No results available yet</p>
                  <Link href={`/answers/upload?testId=${testId}`}>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Student Answers
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
