"use client"

import Link from "next/link"
import { useState } from "react"
import {
  HeartPulse,
  UserPlus,
  ClipboardCheck,
  TrendingUp,
  Users,
  FileCheck,
  Clock,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type UserRole = "student" | "instructor"

const studentStats = [
  {
    label: "Your Submissions",
    value: "18",
    change: "+2 this week",
    icon: FileCheck,
  },
  {
    label: "Pending Grades",
    value: "4",
    change: "Awaiting review",
    icon: Clock,
  },
  {
    label: "Accuracy Rate",
    value: "92%",
    change: "+1% improvement",
    icon: TrendingUp,
  },
  {
    label: "Classmates Tested",
    value: "9",
    change: "On track",
    icon: Users,
  },
]

const instructorStats = [
  {
    label: "Total Submissions",
    value: "128",
    change: "+12 this week",
    icon: FileCheck,
  },
  {
    label: "Registered Patients",
    value: "24",
    change: "+3 this month",
    icon: Users,
  },
  {
    label: "Pending Reviews",
    value: "7",
    change: "Needs attention",
    icon: Clock,
  },
  {
    label: "Accuracy Rate",
    value: "94%",
    change: "+2% improvement",
    icon: TrendingUp,
  },
]

const studentActions = [
  {
    title: "Submit Vitals",
    description: "Record patient vital signs for grading",
    href: "/vitals/submit",
    icon: HeartPulse,
  },
]

const instructorActions = [
  {
    title: "Register Patient",
    description: "Add a new patient with reference vitals",
    href: "/admin/register-patient",
    icon: UserPlus,
  },
  {
    title: "Verify Submissions",
    description: "Compare student submissions to reference values",
    href: "/admin/verify",
    icon: ClipboardCheck,
  },
  {
    title: "Grade Submissions",
    description: "Review and grade student vitals",
    href: "/instructor/reviews",
    icon: FileCheck,
  },
]

const studentActivity = [
  { action: "Vitals submitted for John Smith", time: "2 hours ago", status: "Pending" },
  { action: "Vitals submitted for Robert Williams", time: "1 day ago", status: "Pending" },
  { action: "Submission graded by Dr. Wilson", time: "1 day ago", status: "Graded" },
  { action: "Vitals submitted for Mary Johnson", time: "2 days ago", status: "Pending" },
]

const instructorActivity = [
  { action: "Patient Mary Johnson registered", time: "5 hours ago", status: "Complete" },
  { action: "Submission graded by Dr. Wilson", time: "1 day ago", status: "Graded" },
  { action: "Vitals submitted for Robert Williams", time: "1 day ago", status: "Pending" },
  { action: "Patient Patricia Brown registered", time: "2 days ago", status: "Complete" },
]

export default function DashboardPage() {
  const [role] = useState<UserRole>(() => {
    if (typeof window === "undefined") {
      return "student"
    }
    const storedRole = window.localStorage.getItem("gv-role")
    return storedRole === "student" || storedRole === "instructor" ? storedRole : "student"
  })

  const stats = role === "instructor" ? instructorStats : studentStats
  const quickActions = role === "instructor" ? instructorActions : studentActions
  const recentActivity = role === "instructor" ? instructorActivity : studentActivity

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {role === "instructor" ? "Instructor Dashboard" : "Student Dashboard"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {role === "instructor"
            ? "Monitor submissions, register patients, and grade student work."
            : "Track your submissions and complete assigned vitals."}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                <stat.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="group border-border transition-colors hover:border-primary/40 hover:bg-accent/50">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{action.title}</p>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Activity</h2>
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">Activity Log</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {recentActivity.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-foreground">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                  <Badge
                    variant={
                      item.status === "Complete"
                        ? "default"
                        : item.status === "Graded"
                          ? "secondary"
                          : "outline"
                    }
                    className="shrink-0"
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View all activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
