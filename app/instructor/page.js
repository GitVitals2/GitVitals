'use client';

import { useState } from 'react';

export default function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState('submissions');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [filters, setFilters] = useState({
    cohort: '',
    graded: '',
    readingNumber: '',
    limit: '20'
  });
  const [submissionId, setSubmissionId] = useState('');
  const [grading, setGrading] = useState({
    isCorrect: true,
    instructorFeedback: ''
  });
  const [rosterFilters, setRosterFilters] = useState({
    readingNumber: '1',
    cohort: ''
  });
  const [studentId, setStudentId] = useState('');

  const fetchData = async (url) => {
    setLoading(true);
    try {
      const res = await fetch(url);
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({ error: error.message });
    }
    setLoading(false);
  };

  const submitGrade = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/instructor/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grading)
      });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Instructor Dashboard - API Tester</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {['submissions', 'submission-detail', 'grade', 'roster', 'student-history'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setResponse(null);
            }}
            className={`px-4 py-2 ${activeTab === tab ? 'border-b-2 border-blue-600 font-semibold' : ''}`}
          >
            {tab.replace('-', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">GET /api/instructor/submissions</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Cohort"
              value={filters.cohort}
              onChange={(e) => setFilters({...filters, cohort: e.target.value})}
              className="border p-2 rounded"
            />
            <select
              value={filters.graded}
              onChange={(e) => setFilters({...filters, graded: e.target.value})}
              className="border p-2 rounded"
            >
              <option value="">All (Graded & Ungraded)</option>
              <option value="true">Graded Only</option>
              <option value="false">Ungraded Only</option>
            </select>
            <input
              type="number"
              placeholder="Reading Number (1-50)"
              value={filters.readingNumber}
              onChange={(e) => setFilters({...filters, readingNumber: e.target.value})}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Limit"
              value={filters.limit}
              onChange={(e) => setFilters({...filters, limit: e.target.value})}
              className="border p-2 rounded"
            />
          </div>
          <button
            onClick={() => {
              const params = new URLSearchParams();
              if (filters.cohort) params.append('cohort', filters.cohort);
              if (filters.graded) params.append('graded', filters.graded);
              if (filters.readingNumber) params.append('readingNumber', filters.readingNumber);
              if (filters.limit) params.append('limit', filters.limit);
              fetchData(`/api/instructor/submissions?${params.toString()}`);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Fetch Submissions'}
          </button>
        </div>
      )}

      {/* Submission Detail */}
      {activeTab === 'submission-detail' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">GET /api/instructor/submissions/[id]</h2>
          <input
            type="text"
            placeholder="Submission ID"
            value={submissionId}
            onChange={(e) => setSubmissionId(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <button
            onClick={() => fetchData(`/api/instructor/submissions/${submissionId}`)}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            disabled={loading || !submissionId}
          >
            {loading ? 'Loading...' : 'Get Submission Details'}
          </button>
        </div>
      )}

      {/* Grade Submission */}
      {activeTab === 'grade' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">PATCH /api/instructor/submissions/[id]</h2>
          <input
            type="text"
            placeholder="Submission ID"
            value={submissionId}
            onChange={(e) => setSubmissionId(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={grading.isCorrect === true}
                onChange={() => setGrading({...grading, isCorrect: true})}
              />
              Correct
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={grading.isCorrect === false}
                onChange={() => setGrading({...grading, isCorrect: false})}
              />
              Incorrect
            </label>
          </div>
          <textarea
            placeholder="Instructor Feedback"
            value={grading.instructorFeedback}
            onChange={(e) => setGrading({...grading, instructorFeedback: e.target.value})}
            className="border p-2 rounded w-full h-32"
          />
          <button
            onClick={submitGrade}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            disabled={loading || !submissionId}
          >
            {loading ? 'Submitting...' : 'Submit Grade'}
          </button>
        </div>
      )}

      {/* Roster */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">GET /api/instructor/roster</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Reading Number (Required, 1-50)"
              value={rosterFilters.readingNumber}
              onChange={(e) => setRosterFilters({...rosterFilters, readingNumber: e.target.value})}
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Cohort (Optional)"
              value={rosterFilters.cohort}
              onChange={(e) => setRosterFilters({...rosterFilters, cohort: e.target.value})}
              className="border p-2 rounded"
            />
          </div>
          <button
            onClick={() => {
              const params = new URLSearchParams();
              params.append('readingNumber', rosterFilters.readingNumber);
              if (rosterFilters.cohort) params.append('cohort', rosterFilters.cohort);
              fetchData(`/api/instructor/roster?${params.toString()}`);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            disabled={loading || !rosterFilters.readingNumber}
          >
            {loading ? 'Loading...' : 'Get Roster'}
          </button>
        </div>
      )}

      {/* Student History */}
      {activeTab === 'student-history' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">GET /api/instructor/students/[id]/history</h2>
          <input
            type="text"
            placeholder="Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <button
            onClick={() => fetchData(`/api/instructor/students/${studentId}/history`)}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            disabled={loading || !studentId}
          >
            {loading ? 'Loading...' : 'Get Student History'}
          </button>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-2">Response:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      {/* Quick Reference */}
      <div className="mt-8 p-4 bg-yellow-50 rounded border border-yellow-200">
        <h3 className="font-bold mb-2">📝 Quick Tips:</h3>
        <ul className="text-sm space-y-1">
          <li>• You need to have data in your database to test these endpoints</li>
          <li>• Student IDs and Submission IDs are UUIDs (e.g., &quot;abc-123-def-456&quot;)</li>
          <li>• Reading numbers are 1-50</li>
          <li>• Make sure your DATABASE_URL is configured in .env</li>
          <li>• Run migrations first: <code className="bg-gray-200 px-1">npx prisma migrate dev</code></li>
        </ul>
      </div>
    </div>
  );
}
