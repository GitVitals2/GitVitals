import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalSubmissions,
      pendingReviews,
      totalPatients,
      recentActivity
    ] = await Promise.all([
      prisma.vitalReadings.count(),
      prisma.vitalReadings.count({ where: { isCorrect: false } }),
      prisma.patient.count(),
      prisma.vitalReadings.findMany({
        take: 4,
        orderBy: { submittedAt: 'desc' },
        include: {
          patient: true,
          student: {
            include: {
              user: true
            }
          }
        }
      })
    ]);

    const correctSubmissions = await prisma.vitalReadings.count({ 
      where: { isCorrect: true } 
    });
    
    const accuracyRate = totalSubmissions > 0 
      ? Math.round((correctSubmissions / totalSubmissions) * 100) 
      : 0;

    return NextResponse.json({
      stats: {
        totalSubmissions,
        pendingReviews,
        totalPatients,
        accuracyRate,
        correctSubmissions
      },
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
