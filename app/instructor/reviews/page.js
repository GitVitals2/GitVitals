import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function InstructorReviewsPage() {
  const pending = await prisma.vitalReadings.findMany({
    where: { isCorrect: false },
    orderBy: { submittedAt: 'asc' },
    include: {
      student: true,
      patient: true
    }
  });

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Pending reviews</h1>

      <div style={{ marginTop: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Created</th>
              <th style={th}>Student</th>
              <th style={th}>Person</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {pending.map(r => (
              <tr key={r.id}>
                <td style={td}>{new Date(r.submittedAt).toLocaleString()}</td>
                <td style={td}>{r.student?.name ?? r.studentId}</td>
                <td style={td}>{r.patient?.name ?? r.patientId}</td>
                <td style={td}>
                  <Link href={`/instructor/reviews/${r.id}`} style={{ textDecoration: 'underline' }}>
                    Review
                  </Link>
                </td>
              </tr>
            ))}

            {pending.length === 0 && (
              <tr>
                <td style={td} colSpan={4}>
                  No pending submissions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 18 }}>
        <Link href="/" style={{ textDecoration: 'underline' }}>
          Back
        </Link>
      </div>
    </div>
  );
}

const th = { textAlign: 'left', borderBottom: '1px solid #ddd', padding: '10px 8px' };
const td = { borderBottom: '1px solid #eee', padding: '10px 8px', verticalAlign: 'top' };
