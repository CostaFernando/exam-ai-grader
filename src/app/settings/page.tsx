"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Loader2 } from "lucide-react"

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">AI Configuration</TabsTrigger>
          <TabsTrigger value="export">Export Options</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure general application settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="institution-name">Institution Name</Label>
                  <Input id="institution-name" placeholder="University of Example" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" placeholder="Computer Science" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input id="email" type="email" placeholder="admin@example.edu" />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="notifications" defaultChecked />
                  <Label htmlFor="notifications">Email notifications when grading is complete</Label>
                </div>
              </CardContent>
              <CardFooter>
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
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>AI Configuration</CardTitle>
                <CardDescription>Configure AI grading settings and parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="ai-model">AI Model</Label>
                  <Select defaultValue="gpt-4o">
                    <SelectTrigger id="ai-model">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="strictness">Grading Strictness</Label>
                    <span className="text-sm text-gray-500">Moderate</span>
                  </div>
                  <Slider id="strictness" defaultValue={[50]} max={100} step={1} />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Lenient</span>
                    <span>Strict</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="system-prompt">Custom System Prompt</Label>
                  <Textarea
                    id="system-prompt"
                    placeholder="You are an expert grader with experience in education..."
                    rows={4}
                  />
                  <p className="text-xs text-gray-500">
                    Customize the AI system prompt for more specific grading instructions.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="detailed-feedback" defaultChecked />
                  <Label htmlFor="detailed-feedback">Generate detailed feedback for each question</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="improvement-suggestions" defaultChecked />
                  <Label htmlFor="improvement-suggestions">Include improvement suggestions in feedback</Label>
                </div>
              </CardContent>
              <CardFooter>
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
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
                <CardDescription>Configure how results are exported from the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="export-csv" defaultChecked />
                      <Label htmlFor="export-csv">CSV</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="export-excel" defaultChecked />
                      <Label htmlFor="export-excel">Excel</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="export-pdf" />
                      <Label htmlFor="export-pdf">PDF</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="export-json" />
                      <Label htmlFor="export-json">JSON</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Include in Export</Label>
                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="include-scores" defaultChecked />
                      <Label htmlFor="include-scores">Question Scores</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="include-feedback" defaultChecked />
                      <Label htmlFor="include-feedback">AI Feedback</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="include-answers" defaultChecked />
                      <Label htmlFor="include-answers">Student Answers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="include-analytics" />
                      <Label htmlFor="include-analytics">Class Analytics</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="export-filename">Default Filename Template</Label>
                  <Input id="export-filename" defaultValue="{test_name}_{date}_results" />
                  <p className="text-xs text-gray-500">
                    Use &#123;test_name&#125;, &#123;date&#125;, &#123;class&#125;, etc. as placeholders
                  </p>
                </div>
              </CardContent>
              <CardFooter>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
