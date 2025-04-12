"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, RefreshCw } from "lucide-react"
import { ResultsTable } from "@/components/results-table"
import { ResultsChart } from "@/components/results-chart"

// Mock data
const mockTests = [
  { id: "midterm", name: "Midterm Exam" },
  { id: "final", name: "Final Exam" },
  { id: "quiz1", name: "Quiz 1" },
]

const mockGradingStatus = {
  total: 25,
  completed: 18,
  inProgress: 5,
  pending: 2,
}

export default function Results() {
  const [selectedTest, setSelectedTest] = useState("midterm")

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Grading Results</h1>
        <div className="flex items-center gap-2">
          <Select value={selectedTest} onValueChange={setSelectedTest}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a test" />
            </SelectTrigger>
            <SelectContent>
              {mockTests.map((test) => (
                <SelectItem key={test.id} value={test.id}>
                  {test.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Grading Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">
                  {mockGradingStatus.completed} / {mockGradingStatus.total}
                </span>
                <Badge variant={mockGradingStatus.pending > 0 ? "outline" : "default"}>
                  {mockGradingStatus.pending > 0 ? "In Progress" : "Completed"}
                </Badge>
              </div>
              <Progress value={(mockGradingStatus.completed / mockGradingStatus.total) * 100} />
              <div className="grid grid-cols-3 text-center text-sm">
                <div>
                  <p className="text-gray-500">Completed</p>
                  <p className="font-bold">{mockGradingStatus.completed}</p>
                </div>
                <div>
                  <p className="text-gray-500">In Progress</p>
                  <p className="font-bold">{mockGradingStatus.inProgress}</p>
                </div>
                <div>
                  <p className="text-gray-500">Pending</p>
                  <p className="font-bold">{mockGradingStatus.pending}</p>
                </div>
              </div>
              {mockGradingStatus.pending > 0 && (
                <Button variant="outline" size="sm" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-5xl font-bold">78%</div>
              <p className="text-sm text-gray-500 mt-2">Class Average</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[120px]">
              <ResultsChart />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="table">
        <TabsList className="mb-4">
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="individual">Individual Results</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Student Results</CardTitle>
              <CardDescription>
                Complete grading results for {mockTests.find((t) => t.id === selectedTest)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResultsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>Student {i + 1}</CardTitle>
                    <Badge>{85 - i * 5}%</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500">Questions:</div>
                      <div>5 / 5 answered</div>

                      <div className="text-gray-500">Total Score:</div>
                      <div>{85 - i * 5} / 100</div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
