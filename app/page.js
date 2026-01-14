/**
 * GitVitals - Home Page
 * Landing page with login options for students and instructors
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

          {/* Login Options - Placeholder for future authentication */}
          <div className="space-y-4">
            <button
              className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-white font-medium transition-colors hover:bg-indigo-700"
              disabled
            >
              Student Login
            </button>
            <button
              className="w-full rounded-lg border-2 border-indigo-600 px-6 py-3 text-indigo-600 font-medium transition-colors hover:bg-indigo-50"
              disabled
            >
              Instructor Login
            </button>
          </div>

          {/* Status Message */}
          <div className="mt-6">
            <p className="text-xs text-gray-500">
              Authentication will be configured in the next phase
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
