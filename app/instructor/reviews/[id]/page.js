import prisma from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function InstructorReviewDetailPage({ params }) {
  const { id } = await params;

  const submission = await prisma.vitalReadings.findUnique({
    where: { id },
    include: { 
      student: {
        include: { user: true }
      },
      patient: true 
    }
  });

  if (!submission) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Review</h1>
        <p>Submission not found.</p>
        <Link href="/instructor/reviews" style={{ textDecoration: 'underline' }}>
          Back to pending list
        </Link>
      </div>
    );
  }

  const mlSuggestion = submission.mlPrediction === 0 ? 'correct' : 'incorrect';
  const mlConfidence = submission.mlConfidence ? (submission.mlConfidence * 100).toFixed(1) : null;
  const mlRisk = submission.mlRiskScore ? (submission.mlRiskScore * 100).toFixed(1) : null;

  async function publishReview(formData) {
    'use server';

    const decision = String(formData.get('decision') || '');
    const isCorrect = decision === 'correct';

    await prisma.vitalReadings.update({
      where: { id: String(formData.get('id')) },
      data: {
        isCorrect: isCorrect
      }
    });

    redirect('/instructor/reviews');
  }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Review Submission</h1>

      <p style={{ marginTop: 6, opacity: 0.8 }}>
        Status: <b>{submission.isCorrect ? 'Graded' : 'Pending Review'}</b>
      </p>

      {mlConfidence && (
        <div style={{ 
          marginTop: 14, 
          padding: 16, 
          background: mlSuggestion === 'correct' ? '#d4edda' : '#fff3cd',
          border: `2px solid ${mlSuggestion === 'correct' ? '#28a745' : '#ffc107'}`,
          borderRadius: 12
        }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
            System Analysis
          </div>
          <div style={{ marginBottom: 6 }}>
            <b>Prediction:</b> {mlSuggestion === 'correct' ? 'Normal vitals' : 'Abnormal vitals detected'}
          </div>
          <div style={{ marginBottom: 6 }}>
            <b>Confidence:</b> {mlConfidence}%
          </div>
          {mlRisk && (
            <div>
              <b>Risk Score:</b> {mlRisk}%
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 14, padding: 14, border: '1px solid #eee', borderRadius: 10 }}>
        <div style={{ marginBottom: 8 }}>
          <b>Student:</b> {submission.student?.user?.name ?? submission.studentId}
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Patient:</b> {submission.patient?.name ?? submission.patientId}
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Submitted:</b> {new Date(submission.submittedAt).toLocaleString()}
        </div>

        <div style={{ marginTop: 10 }}>
          <b>Vital Signs</b>
          <div style={{ marginTop: 6, lineHeight: 1.8, fontSize: 15 }}>
            <div>Heart Rate: <b>{submission.heartRate} bpm</b></div>
            <div>Respiratory Rate: <b>{submission.respiratoryRate} rpm</b></div>
            <div>Temperature: <b>{submission.temperature.toString()}°F</b></div>
            <div>Blood Pressure: <b>{submission.bloodPressureSys}/{submission.bloodPressureDia} mmHg</b></div>
            <div>Oxygen Saturation: <b>{submission.oxygenSaturation}%</b></div>
          </div>
        </div>
      </div>

      <form action={publishReview} style={{ marginTop: 18 }}>
        <input type="hidden" name="id" value={submission.id} />

        <div style={{ padding: 14, border: '1px solid #eee', borderRadius: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Decision</div>

          <label style={{ display: 'block', marginBottom: 6 }}>
            <input 
              type="radio" 
              name="decision" 
              value="correct" 
              defaultChecked={mlSuggestion === 'correct'}
              required 
            /> Correct
          </label>

          <label style={{ display: 'block', marginBottom: 12 }}>
            <input 
              type="radio" 
              name="decision" 
              value="incorrect"
              defaultChecked={mlSuggestion === 'incorrect'}
              required 
            /> Incorrect
          </label>

          <div style={{ fontWeight: 700, marginBottom: 8 }}>Instructor notes</div>
          <textarea
            name="notes"
            rows={5}
            placeholder="Write feedback for the student..."
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 10,
              border: '1px solid #ddd',
              resize: 'vertical'
            }}
          />

          <button
            type="submit"
            style={{
              marginTop: 12,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #111',
              background: '#111',
              color: 'white',
              cursor: 'pointer'
            }}>
            Publish review
          </button>
        </div>
      </form>

      <div style={{ marginTop: 18 }}>
        <Link href="/instructor/reviews" style={{ textDecoration: 'underline' }}>
          Back to pending list
        </Link>
      </div>
    </div>
  );
}

function safe(v) {
  return v === null || v === undefined ? '-' : v;
}
