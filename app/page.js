/**
 * GitVitals - Home Page
 * Landing page for the medical vitals tracking application
 */

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          {/* Logo/Title */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-indigo-600">GitVitals</h1>
            <p className="mt-2 text-sm text-gray-600">
              Medical Vitals Tracking System
            </p>
          </div>

          {/* Description */}
          <div className="mb-8">
            <p className="text-gray-700">
              Practice taking and submitting patient vitals with instructor
              review and grading.
            </p>
          </div>

          {/* Quick Access */}
          <div className="space-y-4">
            <a
              href="/dashboard"
              className="block w-full rounded-lg bg-indigo-600 px-6 py-3 text-white font-medium transition-colors hover:bg-indigo-700"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
