import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';

/**
 * GET /api/instructor/submissions
 * Get all submissions for instructor review with auto-comparison to correct answers
 *
 * Query Parameters:
 * - cohort: Filter by student cohort
 * - graded: Filter by grading status (true/false)
 * - startDate: Filter submissions from this date
 * - endDate: Filter submissions until this date
 * - readingNumber: Filter by specific assignment number (1-50)
 * - limit: Number of results per page (default: 50)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const cohort = searchParams.get('cohort');
    const graded = searchParams.get('graded');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const readingNumber = searchParams.get('readingNumber');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause for filtering
    const where = {};

    // Filter by grading status
    if (graded !== null) {
      where.gradedAt = graded === 'true' ? { not: null } : null;
    }

    // Filter by date range (using submittedAt since checkDate doesn't exist in schema)
    if (startDate || endDate) {
      where.submittedAt = {};
      if (startDate) where.submittedAt.gte = new Date(startDate);
      if (endDate) where.submittedAt.lte = new Date(endDate);
    }

    // Filter by reading number
    if (readingNumber) {
      where.readingNumber = parseInt(readingNumber);
    }

    // Filter by cohort (requires joining through student)
    if (cohort) {
      where.student = {
        cohort: cohort
      };
    }

    // Fetch submissions with related data
    const submissions = await prisma.vitalReadings.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        patient: {
          select: {
            id: true,
            name: true,
            relationship: true
          }
        }
      },
      orderBy: [{ submittedAt: 'desc' }],
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.vitalReadings.count({ where });

    // For each submission, fetch the correct answer key and compare
    const submissionsWithComparison = await Promise.all(
      submissions.map(async submission => {
        // Fetch the correct vitals for this patient
        const correctVitals = await prisma.correctVitals.findUnique({
          where: {
            patientId: submission.patientId
          }
        });

        // Calculate comparison if correct vitals exist
        let comparison = null;
        if (correctVitals) {
          comparison = {
            bloodPressureSystolic: {
              submitted: submission.bloodPressureSystolic,
              correct: correctVitals.bloodPressureSystolic,
              isCorrect: submission.bloodPressureSystolic === correctVitals.bloodPressureSystolic,
              difference: submission.bloodPressureSystolic - correctVitals.bloodPressureSystolic
            },
            bloodPressureDiastolic: {
              submitted: submission.bloodPressureDiastolic,
              correct: correctVitals.bloodPressureDiastolic,
              isCorrect: submission.bloodPressureDiastolic === correctVitals.bloodPressureDiastolic,
              difference: submission.bloodPressureDiastolic - correctVitals.bloodPressureDiastolic
            },
            heartRate: {
              submitted: submission.heartRate,
              correct: correctVitals.heartRate,
              isCorrect: submission.heartRate === correctVitals.heartRate,
              difference: submission.heartRate - correctVitals.heartRate
            },
            temperature: {
              submitted: parseFloat(submission.temperature),
              correct: parseFloat(correctVitals.temperature),
              isCorrect: parseFloat(submission.temperature) === parseFloat(correctVitals.temperature),
              difference: parseFloat(submission.temperature) - parseFloat(correctVitals.temperature)
            },
            respiratoryRate: {
              submitted: submission.respiratoryRate,
              correct: correctVitals.respiratoryRate,
              isCorrect: submission.respiratoryRate === correctVitals.respiratoryRate,
              difference: submission.respiratoryRate - correctVitals.respiratoryRate
            },
            oxygenSaturation: {
              submitted: submission.oxygenSaturation,
              correct: correctVitals.oxygenSaturation,
              isCorrect: submission.oxygenSaturation === correctVitals.oxygenSaturation,
              difference: submission.oxygenSaturation - correctVitals.oxygenSaturation
            }
          };

          // Calculate overall correctness
          comparison.allCorrect = Object.values(comparison).every(
            field => typeof field === 'object' && field.isCorrect
          );
        }

        return {
          ...submission,
          correctVitals,
          comparison,
          hasAnswerKey: !!correctVitals
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: submissionsWithComparison,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch submissions',
        details: error.message
      },
      { status: 500 }
    );
  }
}

