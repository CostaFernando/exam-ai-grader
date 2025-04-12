"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Plus, Trash2 } from "lucide-react"

interface StudentAnswer {
  id: string
  name: string
  file: File | null
}

export default function UploadAnswers() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTest, setSelectedTest] = useState("")
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([{ id: "1", name: "Student 1", file: null }])

  const handleAddStudent = () => {
    setStudentAnswers([
      ...studentAnswers,
      {
        id: Date.now().toString(),
        name: `Student ${studentAnswers.length + 1}`,
        file: null,
      },
    ])
  }

  const handleRemoveStudent = (id: string) => {
    setStudentAnswers(studentAnswers.filter((student) => student.id !== id))
  }

  const handleFileSelect = (id: string, file: File) => {
    setStudentAnswers(studentAnswers.map((student) => (student.id === id ? { ...student, file } : student)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/results")
    }, 2000)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Upload Student Answers</h1>

      <Card className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Student Answer Sheets</CardTitle>
            <CardDescription>Upload PDF files containing student answers for grading</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="test-select">Select Test</Label>
              <Select value={selectedTest} onValueChange={setSelectedTest} required>
                <SelectTrigger id="test-select">
                  <SelectValue placeholder="Select a test" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="midterm">Midterm Exam</SelectItem>
                  <SelectItem value="final">Final Exam</SelectItem>
                  <SelectItem value="quiz1">Quiz 1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Student Answer Sheets</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddStudent}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Student
                </Button>
              </div>

              <div className="space-y-4">
                {studentAnswers.map((student) => (
                  <div key={student.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{student.name}</Label>
                      {studentAnswers.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveStudent(student.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    <FileUploader
                      accept=".pdf"
                      maxSize={10}
                      onFileSelect={(file) => handleFileSelect(student.id, file)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedTest || studentAnswers.some((s) => !s.file)}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                "Start Grading"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
