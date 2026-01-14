/**
 * GitVitals - Dashboard Page
 * Main dashboard for authenticated users (students and instructors)
 */

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Welcome to GitVitals
          </h2>
          <p className="text-gray-600 mb-4">
            This is the main dashboard where authenticated users will access their features:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Students: Submit vitals readings for classmates and family members</li>
            <li>Students: View submission history and grades</li>
            <li>Instructors: Review and grade student submissions</li>
            <li>Instructors: Set correct vitals for classmate baselines</li>
          </ul>
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Authentication and role-based access will be implemented in the next phase.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
