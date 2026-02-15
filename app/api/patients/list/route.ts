import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        name: true,
        age: true,
        gender: true,
        relationship: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ patients });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients', patients: [] },
      { status: 500 }
    );
  }
}
