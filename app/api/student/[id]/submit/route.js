import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

/**
 * POST /api/student/[id]/submit
 * Save submitted vitals data for a student
 *
 * @param {NextRequest} request
 * @returns {NextResponse}
 */
export async function POST(request, { params }) {
  const { id: studentId } = await params;
  const data = await request.json();

  try {
    await saveDataToDatabase(studentId, data);
  } catch (error) {
    console.error("Error saving vitals data:", error);
    return NextResponse.json({ message: "Error saving vitals data.", error }, { status: 500 });
  }

  return NextResponse.json({ message: "Vitals data saved successfully." });
}

async function saveDataToDatabase(studentId, data) {
  console.log("Saving data to database:", data);

  await prisma.vitalReadings.create({
    data: {
      enteredById: data.entered_by_id,
      enteredByRole: data.entered_by_role,
      patientId: data.patient_id,
      studentId: studentId,
      readingNumber: data.reading_number,
      heartRate: data.heart_rate,
      bloodPressureSys: data.blood_pressure_systolic,
      bloodPressureDia: data.blood_pressure_diastolic,
      respiratoryRate: data.respiratory_rate,
      temperature: data.temperature,
      oxygenSaturation: data.oxygen_saturation,
      submittedAt: new Date()
    }
  });

  // if (response.error) {
  //   throw new Error(response.error.details + ' ' + response.error.message);
  // }
}
