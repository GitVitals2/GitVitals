import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/supabase';

/**
 * POST /api/patient/create
 * Create a new patient
 *
 * @param {NextRequest} request
 * @returns {NextResponse}
 */
export async function POST(request) {
  const data = await request.json();

  try {
    await saveDataToDatabase(data);
  } catch (error) {
    console.error('Error saving patient data:', error);
    return NextResponse.json({ message: 'Error saving patient data.', error }, { status: 500 });
  }

  return NextResponse.json({ message: 'Patient data saved successfully.' });
}

async function saveDataToDatabase(data) {
  console.log('Saving data to database:', data);

  console.log('Current user: ' + (await getCurrentUser()));

  const user = await getCurrentUser();

  let studentConnect = undefined;

  if (data.student_id) {
    try {
      const student = await prisma.student.findUnique({
        where: { id: data.student_id }
      });
    } catch (error) {
      console.error('Error finding student:', error);
      throw new Error('Error finding student: ' + error.message);
    }
    studentConnect = { connect: { id: student.id } };
  }

  await prisma.patient.create({
    data: {
      student: studentConnect,
      userId: user.id,
      name: data.name,
      relationship: data.relationship,
      age: data.age,
      gender: data.gender,
      isBaselineSet: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
}
