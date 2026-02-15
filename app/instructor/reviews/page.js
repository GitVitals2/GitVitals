import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Clock, User, UserCircle, Eye, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InstructorReviewsPage() {
  // Get ALL submissions (both graded and pending)
  const allSubmissions = await prisma.vitalReadings.findMany({
    orderBy: { submittedAt: 'desc' },
    include: {
      student: {
        include: {
          user: true
        }
      },
      patient: true
    }
  });

  const pending = allSubmissions.filter(s => !s.isCorrect);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Student Submissions
          </h1>
          <p className="text-muted-foreground text-lg">
            Review, grade, and edit all student vital sign submissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{allSubmissions.length}</p>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pending.length}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{allSubmissions.length - pending.length}</p>
                <p className="text-sm text-muted-foreground">Graded</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          {allSubmissions.length === 0 ? (
            /* Empty State */
            <div className="py-16 px-6 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 mb-6">
                <FileText className="h-10 w-10 text-slate-400 dark:text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No Submissions Yet</h3>
              <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                No students have submitted vital signs yet. New submissions will appear here automatically.
              </p>
            </div>
          ) : (
            /* Table */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
                    <th className="text-left px-6 py-4 text-sm font-bold">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Submitted
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-bold">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Student
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-bold">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4" />
                        Patient
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-bold">
                      Vital Signs
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-bold">
                      System Prediction
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-bold">
                      Your Grade
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-bold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allSubmissions.map((r, idx) => (
                    <tr 
                      key={r.id} 
                      className={`border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/50'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(r.submittedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">
                            {r.student?.user?.name || 'Unknown Student'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {r.student?.user?.email || r.studentId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-foreground">
                          {r.patient?.name || r.patientId}
                        </span>
                        <span className="text-xs text-muted-foreground block">
                          Age: {r.patient?.age || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-1 font-mono">
                          <div><span className="font-semibold">HR:</span> {r.heartRate} bpm</div>
                          <div><span className="font-semibold">BP:</span> {r.bloodPressureSys}/{r.bloodPressureDia}</div>
                          <div><span className="font-semibold">SpO₂:</span> {r.oxygenSaturation}%</div>
                          <div><span className="font-semibold">Temp:</span> {r.temperature.toString()}°F</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {r.mlPrediction !== null ? (
                          <div className="text-xs">
                            <div className={`font-semibold ${r.mlPrediction === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                              {r.mlPrediction === 0 ? 'Normal' : 'Abnormal'}
                            </div>
                            {r.mlConfidence && (
                              <div className="text-muted-foreground">
                                {(parseFloat(r.mlConfidence) * 100).toFixed(0)}% conf.
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not analyzed</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {r.isCorrect ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
                            <span className="text-lg">✓</span>
                            <span className="text-xs font-semibold">Correct</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-200 dark:border-amber-800">
                            <span className="text-lg">⏳</span>
                            <span className="text-xs font-semibold">Pending</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/instructor/reviews/${r.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg shadow-teal-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          {r.isCorrect ? 'View / Edit' : 'Grade'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
