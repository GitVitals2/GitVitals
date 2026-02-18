import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma.js';

/**
 * GET /api/instructor/roster
 * Get roster showing which students submitted vs. who didn't for a specific assignment
 *
 * Query Parameters:
 * - readingNumber: Required - which assignment (1-50)
 * - cohort: Optional - filter by student cohort
 * - patientId: Optional - filter by specific patient
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const readingNumber = searchParams.get('readingNumber');
    const cohort = searchParams.get('cohort');
    const patientId = searchParams.get('patientId');

    // Validate required parameter
    if (!readingNumber) {
      return NextResponse.json({ success: false, error: 'readingNumber is required' }, { status: 400 });
    }

    const readingNum = parseInt(readingNumber);

    // Build where clause for students
    const studentWhere = {
      role: 'STUDENT'
    };

    // Get all students (optionally filtered by cohort)
    const students = await prisma.student.findMany({
      where: cohort ? { cohort } : {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    });

    // Get all submissions for this reading number
    const submissionWhere = {
      readingNumber: readingNum
    };

    if (patientId) {
      submissionWhere.patientId = patientId;
    }

    const submissions = await prisma.vitalReadings.findMany({
      where: submissionWhere,
      include: {
        patient: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Create a map of student submissions
    const submissionMap = new Map();
    submissions.forEach(submission => {
      if (!submissionMap.has(submission.studentId)) {
        submissionMap.set(submission.studentId, []);
      }
      submissionMap.get(submission.studentId).push(submission);
    });

    // Build roster
    const roster = students.map(student => {
      const studentSubmissions = submissionMap.get(student.id) || [];
      const hasSubmitted = studentSubmissions.length > 0;
      const latestSubmission = hasSubmitted
        ? studentSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0]
        : null;

      return {
        studentId: student.id,
        studentNumber: student.studentId,
        name: student.user.name,
        email: student.user.email,
        cohort: student.cohort,
        hasSubmitted,
        submissionCount: studentSubmissions.length,
        latestSubmission: latestSubmission
          ? {
              id: latestSubmission.id,
              submittedAt: latestSubmission.submittedAt,
              gradedAt: latestSubmission.gradedAt,
              isCorrect: latestSubmission.isCorrect,
              patientName: latestSubmission.patient.name,
              patientId: latestSubmission.patient.id
            }
          : null,
        allSubmissions: studentSubmissions.map(sub => ({
          id: sub.id,
          submittedAt: sub.submittedAt,
          gradedAt: sub.gradedAt,
          isCorrect: sub.isCorrect,
          patientName: sub.patient.name
        }))
      };
    });

    // Calculate statistics
    const stats = {
      totalStudents: roster.length,
      submitted: roster.filter(s => s.hasSubmitted).length,
      notSubmitted: roster.filter(s => !s.hasSubmitted).length,
      graded: roster.filter(s => s.latestSubmission?.gradedAt).length,
      ungraded: roster.filter(s => s.hasSubmitted && !s.latestSubmission?.gradedAt).length,
      submissionRate:
        roster.length > 0 ? ((roster.filter(s => s.hasSubmitted).length / roster.length) * 100).toFixed(2) + '%' : '0%'
    };

    return NextResponse.json({
      success: true,
      data: {
        readingNumber: readingNum,
        cohort: cohort || 'all',
        roster: roster,
        stats: stats,
        studentsWhoSubmitted: roster.filter(s => s.hasSubmitted),
        studentsWhoDidNotSubmit: roster.filter(s => !s.hasSubmitted)
      }
    });
  } catch (error) {
    console.error('Error fetching roster:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch roster',
        details: error.message
      },
      { status: 500 }
    );
  }
}

