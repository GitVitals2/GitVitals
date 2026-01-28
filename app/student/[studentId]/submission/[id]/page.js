import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function StudentSubmissionDetailPage({ params }) {
  const { studentId, id } = params;

  const r = await prisma.vitalReading.findFirst({
    where: {
      id: String(id),
      studentId: String(studentId),
    },
    include: {
      patient: true,
    },
  });

  if (!r) return notFound();

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Submission details</h1>

      <p style={{ marginTop: 6, opacity: 0.8 }}>
        Student ID: <code>{studentId}</code>
      </p>

      <div style={{ marginTop: 16, lineHeight: 1.6 }}>
        <div><b>Date:</b> {new Date(r.createdAt).toLocaleString()}</div>
        <div><b>Person:</b> {r.patient?.name ?? r.patientId}</div>
        <div>
          <b>Vitals:</b>{" "}
          HR: {safe(r.heartRate)} | RR: {safe(r.respRate)} | Temp: {safe(r.tempF)}°F | BP:{" "}
          {safe(r.systolicBp)}/{safe(r.diastolicBp)} | SpO₂: {safe(r.spo2Pct)}%
        </div>
        <div><b>Status:</b> {r.status}</div>
        <div><b>Grade:</b> {r.grade ?? "-"}</div>
        <div><b>Instructor notes:</b> {r.instructorNotes ?? "-"}</div>
      </div>

      <div style={{ marginTop: 18 }}>
        <Link
          href={`/student/${studentId}/submission`}
          style={{ textDecoration: "underline" }}
        >
          Back to submissions
        </Link>
      </div>
    </div>
  );
}

function safe(v) {
  return v === null || v === undefined ? "-" : v;
}
