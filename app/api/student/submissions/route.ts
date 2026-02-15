import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { students: true }
    });

    if (!user || !user.students) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const submissions = await prisma.vitalReadings.findMany({
      where: {
        studentId: user.students.id
      },
      include: {
        patient: true
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
