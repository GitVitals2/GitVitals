'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, CheckCircle2, XCircle, Activity, AlertCircle } from 'lucide-react';

type Submission = {
  id: string;
  submittedAt: string;
  isCorrect: boolean;
  heartRate: number;
  bloodPressureSys: number;
  bloodPressureDia: number;
  respiratoryRate: number;
  temperature: string;
  oxygenSaturation: number;
  mlPrediction: number | null;
  mlRiskScore: string | null;
  mlConfidence: string | null;
  patient: {
    name: string;
  };
};

export default function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const userEmail = localStorage.getItem('gv-email');
        if (!userEmail) {
          alert('Please log in');
          return;
        }

        const response = await fetch('/api/student/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail })
        });

        if (response.ok) {
          const data = await response.json();
          setSubmissions(data.submissions || []);
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            My Submissions
          </h1>
          <p className="text-muted-foreground text-lg">
            View your vital sign submission history and grades
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 overflow-hidden">
          {submissions.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No submissions yet</h3>
              <p className="text-muted-foreground mb-6">
                Submit your first vitals to see them here
              </p>
              <Link 
                href="/vitals/submit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Submit Vitals
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-teal-500 to-cyan-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Patient</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Submitted</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Vitals</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">System Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission, idx) => (
                    <tr 
                      key={submission.id}
                      className={`border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-700/20'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{submission.patient.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {new Date(submission.submittedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          <div>HR: {submission.heartRate} bpm</div>
                          <div>BP: {submission.bloodPressureSys}/{submission.bloodPressureDia}</div>
                          <div>SpO₂: {submission.oxygenSaturation}%</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {submission.isCorrect ? (
                            <>
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <span className="text-green-700 dark:text-green-400 font-semibold">Correct</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-5 w-5 text-amber-600" />
                              <span className="text-amber-700 dark:text-amber-400 font-semibold">Pending</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {submission.mlConfidence ? (
                          <div className="text-sm">
                            <div className="font-medium">
                              {submission.mlPrediction === 0 ? 'Normal' : 'Abnormal'}
                            </div>
                            <div className="text-muted-foreground">
                              {(parseFloat(submission.mlConfidence) * 100).toFixed(0)}% confidence
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-slate-400 dark:text-slate-500 italic">
                            Not analyzed
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Link 
            href="/dashboard"
            className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
