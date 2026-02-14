import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUserFromRequest } from "@/lib/auth";

/**
 * POST /api/patient/[id]/correct-vitals
 * Save correct vitals data for a patient
 *
 * @param {NextRequest} request
 * @returns {NextResponse}
 */
export async function POST(request, { params }) {
  try {
    const userResponse = await getCurrentUserFromRequest(request);

    if (!userResponse.success) {
      return NextResponse.json({ message: "User not authenticated." }, { status: 401 });
    }

    const { id: patientId } = await params;
    const data = await request.json();

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { student: true }
    });

    if (!patient) {
      return NextResponse.json({ message: "Patient not found." }, { status: 404 });
    }

    const createdById = userResponse.user.id;

    await prisma.correctVitals.create({
      data: {
        patient: { connect: { id: patientId } },
        createdBy: { connect: { id: createdById } },
        ...data
      }
    });

    await prisma.patient.update({
      where: { id: patientId },
      data: { isBaselineSet: true }
    });

    return NextResponse.json({ message: "Correct vitals data saved for patient with ID: " + patientId });
  } catch (error) {
    console.error("Error saving correct vitals data:", error);
    return NextResponse.json({ message: "Error saving correct vitals data.", error }, { status: 500 });
  }
}
