"use client"

import { useState } from "react"
import { Search, Check, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const MOCK_CORRECT = {
  dob: "1985-03-15",
  height: 5.8,
  weight: 165,
  shoes: "without",
  spo2: 98,
  temp: 98.6,
  pulse: 72,
  resp: 16,
  bp: "120/80",
}

const MOCK_SUBMISSIONS = [
  {
    id: 1,
    student: "John Doe",
    datetime: "2025-01-20 09:30",
    dob: "1985-03-15",
    height: 5.8,
    weight: 165,
    spo2: 98,
    temp: 98.6,
    bp: "120/80",
  },
  {
    id: 2,
    student: "Jane Smith",
    datetime: "2025-01-21 10:15",
    dob: "1985-03-14",
    height: 5.7,
    weight: 163,
    spo2: 97,
    temp: 98.4,
    bp: "118/78",
  },
]

function MatchBadge({ submitted, correct }: { submitted: string | number; correct: string | number }) {
  const isMatch = String(submitted) === String(correct)
  return isMatch ? (
    <Check className="inline-block h-4 w-4 text-primary" />
  ) : (
    <X className="inline-block h-4 w-4 text-destructive" />
  )
}

export default function VerifySubmissionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showResults, setShowResults] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Verify Submissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Teacher Portal — Compare student submissions against reference values.
        </p>
      </div>

      {/* Search */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground">Search Submissions</CardTitle>
          <CardDescription>Filter by student name to find their submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Type student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setShowResults(true)}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">Submission Comparison</CardTitle>
            <CardDescription>
              Green check = matches reference, Red x = does not match
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[160px]">Student / Date</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead>Height</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>SpO2</TableHead>
                  <TableHead>Temp</TableHead>
                  <TableHead>BP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Reference row */}
                <TableRow className="bg-accent/50">
                  <TableCell className="font-semibold text-foreground">
                    <Badge variant="secondary">Reference Values</Badge>
                  </TableCell>
                  <TableCell className="text-foreground">{MOCK_CORRECT.dob}</TableCell>
                  <TableCell className="text-foreground">{MOCK_CORRECT.height}</TableCell>
                  <TableCell className="text-foreground">{MOCK_CORRECT.weight}</TableCell>
                  <TableCell className="text-foreground">{MOCK_CORRECT.spo2}</TableCell>
                  <TableCell className="text-foreground">{MOCK_CORRECT.temp}</TableCell>
                  <TableCell className="text-foreground">{MOCK_CORRECT.bp}</TableCell>
                </TableRow>

                {/* Student submissions */}
                {MOCK_SUBMISSIONS.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground">{sub.student}</span>
                        <span className="text-xs text-muted-foreground">{sub.datetime}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground">{sub.dob}</span>
                        <MatchBadge submitted={sub.dob} correct={MOCK_CORRECT.dob} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground">{sub.height}</span>
                        <MatchBadge submitted={sub.height} correct={MOCK_CORRECT.height} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground">{sub.weight}</span>
                        <MatchBadge submitted={sub.weight} correct={MOCK_CORRECT.weight} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground">{sub.spo2}</span>
                        <MatchBadge submitted={sub.spo2} correct={MOCK_CORRECT.spo2} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground">{sub.temp}</span>
                        <MatchBadge submitted={sub.temp} correct={MOCK_CORRECT.temp} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground">{sub.bp}</span>
                        <MatchBadge submitted={sub.bp} correct={MOCK_CORRECT.bp} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
