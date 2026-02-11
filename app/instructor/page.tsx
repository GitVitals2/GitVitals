"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Search, Download } from "lucide-react"

export default function InstructorPage() {
  const [response, setResponse] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [filters, setFilters] = useState({
    cohort: "",
    graded: "",
    readingNumber: "",
    limit: "20",
  })
  const [submissionId, setSubmissionId] = useState("")
  const [grading, setGrading] = useState({
    isCorrect: true,
    instructorFeedback: "",
  })
  const [rosterFilters, setRosterFilters] = useState({
    readingNumber: "1",
    cohort: "",
  })
  const [studentId, setStudentId] = useState("")

  const fetchData = async (url: string) => {
    setLoading(true)
    try {
      const res = await fetch(url)
      const data = await res.json()
      setResponse(data)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error"
      setResponse({ error: message })
    }
    setLoading(false)
  }

  const submitGrade = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/instructor/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(grading),
      })
      const data = await res.json()
      setResponse(data)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error"
      setResponse({ error: message })
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Instructor Panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage submissions, grade students, and review roster data.
        </p>
      </div>

      <Tabs defaultValue="submissions" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="submission-detail">Detail</TabsTrigger>
          <TabsTrigger value="grade">Grade</TabsTrigger>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="student-history">Student History</TabsTrigger>
        </TabsList>

        {/* Submissions List */}
        <TabsContent value="submissions" className="mt-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">
                <Badge variant="outline" className="mr-2 font-mono text-xs">
                  GET
                </Badge>
                /api/instructor/submissions
              </CardTitle>
              <CardDescription>Fetch student submissions with optional filters</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label>Cohort</Label>
                  <Input
                    placeholder="e.g. Fall2025"
                    value={filters.cohort}
                    onChange={(e) => setFilters({ ...filters, cohort: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Graded Status</Label>
                  <Select
                    value={filters.graded}
                    onValueChange={(value) => setFilters({ ...filters, graded: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">Graded Only</SelectItem>
                      <SelectItem value="false">Ungraded Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Reading Number (1-50)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 5"
                    value={filters.readingNumber}
                    onChange={(e) => setFilters({ ...filters, readingNumber: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Limit</Label>
                  <Input
                    type="number"
                    value={filters.limit}
                    onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
                  />
                </div>
              </div>
              <Button
                className="w-full sm:w-auto sm:self-end"
                onClick={() => {
                  const params = new URLSearchParams()
                  if (filters.cohort) params.append("cohort", filters.cohort)
                  if (filters.graded && filters.graded !== "all") params.append("graded", filters.graded)
                  if (filters.readingNumber) params.append("readingNumber", filters.readingNumber)
                  if (filters.limit) params.append("limit", filters.limit)
                  fetchData(`/api/instructor/submissions?${params.toString()}`)
                }}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Fetch Submissions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submission Detail */}
        <TabsContent value="submission-detail" className="mt-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">
                <Badge variant="outline" className="mr-2 font-mono text-xs">
                  GET
                </Badge>
                {"/api/instructor/submissions/[id]"}
              </CardTitle>
              <CardDescription>Get details of a specific submission</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Submission ID</Label>
                <Input
                  placeholder="Enter submission ID"
                  value={submissionId}
                  onChange={(e) => setSubmissionId(e.target.value)}
                />
              </div>
              <Button
                className="w-full sm:w-auto sm:self-end"
                onClick={() => fetchData(`/api/instructor/submissions/${submissionId}`)}
                disabled={loading || !submissionId}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Fetch Detail
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grade */}
        <TabsContent value="grade" className="mt-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">
                <Badge variant="outline" className="mr-2 font-mono text-xs">
                  PATCH
                </Badge>
                {"/api/instructor/submissions/[id]"}
              </CardTitle>
              <CardDescription>Grade a student submission</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Submission ID</Label>
                <Input
                  placeholder="Enter submission ID"
                  value={submissionId}
                  onChange={(e) => setSubmissionId(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="isCorrect"
                  checked={grading.isCorrect}
                  onChange={(event) => setGrading({ ...grading, isCorrect: event.target.checked })}
                />
                <Label htmlFor="isCorrect">
                  {grading.isCorrect ? "Marked as Correct" : "Marked as Incorrect"}
                </Label>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Instructor Feedback</Label>
                <Textarea
                  placeholder="Provide feedback for the student..."
                  value={grading.instructorFeedback}
                  onChange={(e) => setGrading({ ...grading, instructorFeedback: e.target.value })}
                  rows={4}
                />
              </div>
              <Button
                className="w-full sm:w-auto sm:self-end"
                onClick={submitGrade}
                disabled={loading || !submissionId}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit Grade
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roster */}
        <TabsContent value="roster" className="mt-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">
                <Badge variant="outline" className="mr-2 font-mono text-xs">
                  GET
                </Badge>
                /api/instructor/roster
              </CardTitle>
              <CardDescription>View class roster and submission status</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label>Reading Number</Label>
                  <Input
                    type="number"
                    value={rosterFilters.readingNumber}
                    onChange={(e) => setRosterFilters({ ...rosterFilters, readingNumber: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Cohort</Label>
                  <Input
                    placeholder="e.g. Fall2025"
                    value={rosterFilters.cohort}
                    onChange={(e) => setRosterFilters({ ...rosterFilters, cohort: e.target.value })}
                  />
                </div>
              </div>
              <Button
                className="w-full sm:w-auto sm:self-end"
                onClick={() => {
                  const params = new URLSearchParams()
                  params.append("readingNumber", rosterFilters.readingNumber)
                  if (rosterFilters.cohort) params.append("cohort", rosterFilters.cohort)
                  fetchData(`/api/instructor/roster?${params.toString()}`)
                }}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Fetch Roster
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student History */}
        <TabsContent value="student-history" className="mt-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">
                <Badge variant="outline" className="mr-2 font-mono text-xs">
                  GET
                </Badge>
                {"/api/instructor/students/[id]/history"}
              </CardTitle>
              <CardDescription>View a specific student&apos;s submission history</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Student ID</Label>
                <Input
                  placeholder="Enter student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>
              <Button
                className="w-full sm:w-auto sm:self-end"
                onClick={() => fetchData(`/api/instructor/students/${studentId}/history`)}
                disabled={loading || !studentId}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Fetch History
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* API Response */}
      {response && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-96 overflow-auto rounded-lg bg-foreground p-4 text-xs text-primary-foreground">
              {JSON.stringify(response, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
