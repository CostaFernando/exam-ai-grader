"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Search } from "lucide-react"

// Mock data
const mockStudents = Array.from({ length: 10 }).map((_, i) => ({
  id: `student-${i + 1}`,
  name: `Student ${i + 1}`,
  score: Math.floor(60 + Math.random() * 40),
  status: i < 8 ? "completed" : i === 8 ? "in-progress" : "pending",
  questions: [
    { id: 1, score: Math.floor(7 + Math.random() * 4), maxScore: 10 },
    { id: 2, score: Math.floor(12 + Math.random() * 4), maxScore: 15 },
    { id: 3, score: Math.floor(17 + Math.random() * 4), maxScore: 20 },
    { id: 4, score: Math.floor(22 + Math.random() * 4), maxScore: 25 },
    { id: 5, score: Math.floor(27 + Math.random() * 4), maxScore: 30 },
  ],
}))

export function ResultsTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredStudents = mockStudents.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search students..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm">
          Filter
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total Score</TableHead>
              <TableHead className="text-center">Q1 (10)</TableHead>
              <TableHead className="text-center">Q2 (15)</TableHead>
              <TableHead className="text-center">Q3 (20)</TableHead>
              <TableHead className="text-center">Q4 (25)</TableHead>
              <TableHead className="text-center">Q5 (30)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      student.status === "completed"
                        ? "default"
                        : student.status === "in-progress"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {student.status === "completed"
                      ? "Completed"
                      : student.status === "in-progress"
                        ? "In Progress"
                        : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {student.status === "pending" ? "-" : `${student.score}/100`}
                </TableCell>
                {student.questions.map((question) => (
                  <TableCell key={question.id} className="text-center">
                    {student.status === "pending"
                      ? "-"
                      : student.status === "in-progress" && question.id > 3
                        ? "-"
                        : `${question.score}/${question.maxScore}`}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
