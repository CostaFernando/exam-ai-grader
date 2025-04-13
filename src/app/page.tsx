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
import { FileText, Upload, BarChart2, Settings } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-2">AI Test Grading Assistant</h1>
      <p className="text-gray-500 mb-8">
        Automate grading of discursive questions with AI assistance
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Upload Test</CardTitle>
            <CardDescription>Create a new test to grade</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <FileText size={64} className="text-gray-400" />
          </CardContent>
          <CardFooter>
            <Link href="/provas/new" className="w-full">
              <Button className="w-full">Create New Test</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Upload Answers</CardTitle>
            <CardDescription>Add student answers to grade</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <Upload size={64} className="text-gray-400" />
          </CardContent>
          <CardFooter>
            <Link href="/answers/upload" className="w-full">
              <Button className="w-full" variant="outline">
                Upload Answers
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">View Results</CardTitle>
            <CardDescription>See grading results and feedback</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <BarChart2 size={64} className="text-gray-400" />
          </CardContent>
          <CardFooter>
            <Link href="/results" className="w-full">
              <Button className="w-full" variant="outline">
                View Results
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Settings</CardTitle>
            <CardDescription>Configure grading preferences</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <Settings size={64} className="text-gray-400" />
          </CardContent>
          <CardFooter>
            <Link href="/settings" className="w-full">
              <Button className="w-full" variant="outline">
                Settings
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
