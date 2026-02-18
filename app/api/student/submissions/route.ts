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

    console.log('Fetching submissions for:', userEmail);

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { students: true }
    });

    console.log('User found:', user ? 'Yes' : 'No');
    console.log('Student record:', user?.students ? 'Yes' : 'No');

    if (!user || !user.students) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    console.log('Querying submissions for studentId:', user.students.id);

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

    console.log('Submissions found:', submissions.length);
    if (submissions.length > 0) {
      console.log('First submission sample:', JSON.stringify(submissions[0], null, 2));
    }

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
