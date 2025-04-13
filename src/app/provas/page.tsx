"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";

// Mock data for tests
const mockTests = [
  {
    id: "1",
    name: "Midterm Exam",
    createdAt: "2025-03-15",
    questionCount: 5,
    studentsGraded: 18,
    totalStudents: 25,
    status: "active",
  },
  {
    id: "2",
    name: "Final Exam",
    createdAt: "2025-04-02",
    questionCount: 8,
    studentsGraded: 0,
    totalStudents: 0,
    status: "active",
  },
  {
    id: "3",
    name: "Quiz 1",
    createdAt: "2025-02-10",
    questionCount: 3,
    studentsGraded: 22,
    totalStudents: 22,
    status: "completed",
  },
  {
    id: "4",
    name: "Pop Quiz",
    createdAt: "2025-01-25",
    questionCount: 2,
    studentsGraded: 20,
    totalStudents: 20,
    status: "archived",
  },
];

export default function TestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tests, setTests] = useState(mockTests);

  const filteredTests = tests.filter((test) =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteTest = (id: string) => {
    setTests(tests.filter((test) => test.id !== id));
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Provas</h1>
        <Link href="/provas/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Test
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas Provas</CardTitle>
          <CardDescription>
            Manage your created tests and their grading status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search tests..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Filter</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Todas Provas</DropdownMenuItem>
                <DropdownMenuItem>Active</DropdownMenuItem>
                <DropdownMenuItem>Completed</DropdownMenuItem>
                <DropdownMenuItem>Archived</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {filteredTests.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium">No tests found</h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchTerm
                  ? "Try a different search term"
                  : "Create your first test to get started"}
              </p>
              {!searchTerm && (
                <Link href="/provas/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Test
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Students Graded</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.name}</TableCell>
                      <TableCell>{test.createdAt}</TableCell>
                      <TableCell>{test.questionCount}</TableCell>
                      <TableCell>
                        {test.studentsGraded} / {test.totalStudents}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            test.status === "active"
                              ? "default"
                              : test.status === "completed"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {test.status.charAt(0).toUpperCase() +
                            test.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/provas/${test.id}`}>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/provas/${test.id}/edit`}>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Test
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/answers/upload?testId=${test.id}`}>
                              <DropdownMenuItem>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Student Answers
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTest(test.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                              <span className="text-red-500">Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
