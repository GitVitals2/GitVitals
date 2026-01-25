import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function StudentSubmissionsPage({ params }) {
  const { studentId } = params;

  const submissions = await prisma.vitalReading.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    include: {
      patient: true,
    },
  });

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Past submissions</h1>
      <p style={{ marginTop: 6, opacity: 0.8 }}>
        Student ID: <code>{studentId}</code>
      </p>

      <div style={{ marginTop: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Date</th>
              <th style={th}>Person</th>
              <th style={th}>Vitals</th>
              <th style={th}>Status</th>
              <th style={th}>Grade</th>
              <th style={th}>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((r) => (
              <tr key={r.id}>
                <td style={td}>{formatDate(r.createdAt)}</td>
                <td style={td}>{r.patient?.name ?? r.patientId}</td>
                <td style={td}>
                  HR: {safe(r.heartRate)} | RR: {safe(r.respRate)} | Temp: {safe(r.tempF)}°F
                  {" | "}BP: {safe(r.systolicBp)}/{safe(r.diastolicBp)}
                  {" | "}SpO₂: {safe(r.spo2Pct)}%
                </td>
                <td style={td}>{r.status}</td>
                <td style={td}>{r.grade ?? "-"}</td>
                <td style={td}>{r.instructorNotes ?? "-"}</td>
              </tr>
            ))}

            {submissions.length === 0 && (
              <tr>
                <td style={td} colSpan={6}>
                  No submissions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 18 }}>
        <Link href="/" style={{ textDecoration: "underline" }}>
          Back
        </Link>
      </div>
    </div>
  );
}

const th = { textAlign: "left", borderBottom: "1px solid #ddd", padding: "10px 8px" };
const td = { borderBottom: "1px solid #eee", padding: "10px 8px", verticalAlign: "top" };

function formatDate(d) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d);
  }
}

function safe(v) {
  return v === null || v === undefined ? "-" : v;
}
