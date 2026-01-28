import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function InstructorReviewDetailPage({ params }) {
  const { id } = params;

  const submission = await prisma.vitalReading.findUnique({
    where: { id },
    include: { student: true, patient: true },
  });

  if (!submission) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Review</h1>
        <p>Submission not found.</p>
        <Link href="/instructor/reviews" style={{ textDecoration: "underline" }}>
          Back to pending list
        </Link>
      </div>
    );
  }

  async function publishReview(formData) {
    "use server";

    const decision = String(formData.get("decision") || "");
    const notes = String(formData.get("notes") || "").trim();
    const grade = decision === "correct" ? 100 : 0;

    await prisma.vitalReading.update({
      where: { id: String(formData.get("id")) },
      data: {
        grade,
        instructorNotes: notes,
        status: "REVIEWED",
      },
    });

    redirect("/instructor/reviews");
  }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Review submission</h1>

      <p style={{ marginTop: 6, opacity: 0.8 }}>
        Status: <b>{submission.status}</b>
      </p>

      <div style={{ marginTop: 14, padding: 14, border: "1px solid #eee", borderRadius: 10 }}>
        <div style={{ marginBottom: 8 }}>
          <b>Student:</b> {submission.student?.name ?? submission.studentId}
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Person:</b> {submission.patient?.name ?? submission.patientId}
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Created:</b> {new Date(submission.createdAt).toLocaleString()}
        </div>

        <div style={{ marginTop: 10 }}>
          <b>Vitals</b>
          <div style={{ marginTop: 6, lineHeight: 1.6 }}>
            HR: {safe(submission.heartRate)} <br />
            RR: {safe(submission.respRate)} <br />
            Temp (F): {safe(submission.tempF)} <br />
            BP: {safe(submission.systolicBp)}/{safe(submission.diastolicBp)} <br />
            SpO₂: {safe(submission.spo2Pct)}
          </div>
        </div>
      </div>

      <form action={publishReview} style={{ marginTop: 18 }}>
        <input type="hidden" name="id" value={submission.id} />

        <div style={{ padding: 14, border: "1px solid #eee", borderRadius: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Decision</div>

          <label style={{ display: "block", marginBottom: 6 }}>
            <input type="radio" name="decision" value="correct" required /> Correct
          </label>

          <label style={{ display: "block", marginBottom: 12 }}>
            <input type="radio" name="decision" value="incorrect" required /> Incorrect
          </label>

          <div style={{ fontWeight: 700, marginBottom: 8 }}>Instructor notes</div>
          <textarea
            name="notes"
            rows={5}
            placeholder="Write feedback for the student..."
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ddd",
              resize: "vertical",
            }}
          />

          <button
            type="submit"
            style={{
              marginTop: 12,
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #111",
              background: "#111",
              color: "white",
              cursor: "pointer",
            }}
          >
            Publish review
          </button>
        </div>
      </form>

      <div style={{ marginTop: 18 }}>
        <Link href="/instructor/reviews" style={{ textDecoration: "underline" }}>
          Back to pending list
        </Link>
      </div>
    </div>
  );
}

function safe(v) {
  return v === null || v === undefined ? "-" : v;
}