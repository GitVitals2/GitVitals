'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import {
  HeartPulse,
  UserPlus,
  ClipboardCheck,
  TrendingUp,
  Users,
  FileCheck,
  Clock,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingReviews: 0,
    totalPatients: 0,
    accuracyRate: 0,
    correctSubmissions: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get role from localStorage
    const userRole = localStorage.getItem('gv-role');
    setRole(userRole);

    // Fetch dashboard data
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        setStats(data.stats);
        setRecentActivity(data.recentActivity);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const isInstructor = role === 'instructor';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Page header */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            {isInstructor ? 'Instructor Dashboard' : 'Student Dashboard'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isInstructor 
              ? 'Review student submissions and manage grading'
              : 'Track your submissions and complete assigned vitals'}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-border shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/30">
                <FileCheck className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {isInstructor ? 'Total Submissions' : 'Your Submissions'}
                </p>
                <p className="text-3xl font-bold text-foreground">{stats.totalSubmissions}</p>
                <p className="text-xs text-muted-foreground mt-1">Total recorded</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-75">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {isInstructor ? 'Pending Reviews' : 'Pending Grades'}
                </p>
                <p className="text-3xl font-bold text-foreground">{stats.pendingReviews}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isInstructor ? 'Need grading' : 'Awaiting review'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Accuracy Rate</p>
                <p className="text-3xl font-bold text-foreground">{stats.accuracyRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.correctSubmissions} correct
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Patients</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalPatients}</p>
                <p className="text-xs text-muted-foreground mt-1">In database</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isInstructor ? (
              <>
                <Link href="/instructor/reviews">
                  <Card className="border-border shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                          <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-lg">Review Submissions</CardTitle>
                      </div>
                      <CardDescription className="mt-2">
                        Grade student vital sign submissions
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
                <Link href="/admin/register-patient">
                  <Card className="border-border shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                          <UserPlus className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-lg">Register Patient</CardTitle>
                      </div>
                      <CardDescription className="mt-2">
                        Add new patients to the system
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </>
            ) : (
              <>
                <Link href="/vitals/submit">
                  <Card className="border-border shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600">
                          <HeartPulse className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-lg">Submit Vitals</CardTitle>
                      </div>
                      <CardDescription className="mt-2">
                        Record patient vital signs for grading
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
                <Link href="/student/submissions">
                  <Card className="border-border shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                          <FileCheck className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-lg">View My Submissions</CardTitle>
                      </div>
                      <CardDescription className="mt-2">
                        See your submission history and grades
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Recent Activity</h2>
          <Card className="border-border shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80">
            <CardHeader>
              <CardTitle className="text-lg">Activity Log</CardTitle>
              <CardDescription>
                {isInstructor ? 'Latest submissions and grading activity' : 'Your latest actions and updates'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground mb-2">No activity yet</p>
                  <p className="text-sm text-muted-foreground">
                    {isInstructor 
                      ? 'Waiting for student submissions to review'
                      : 'Submit your first vitals to get started!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity: any) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          Vitals submitted for {activity.patient?.name || 'Unknown Patient'}
                          {isInstructor && activity.student?.user?.name && (
                            <span className="text-muted-foreground"> by {activity.student.user.name}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.submittedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <Badge
                        variant={activity.isCorrect ? "default" : "secondary"}
                        className={activity.isCorrect 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        }
                      >
                        {activity.isCorrect ? "Graded" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
