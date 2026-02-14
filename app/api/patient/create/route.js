import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUserFromRequest } from "@/lib/auth";

/**
 * POST /api/patient/create
 * Create a new patient
 *
 * @param {NextRequest} request
 * @returns {NextResponse}
 */
export async function POST(request) {
  const userResponse = await getCurrentUserFromRequest(request);

  if (!userResponse.success) {
    return NextResponse.json({ message: "User not authenticated." }, { status: 401 });
  }

  const data = await request.json();

  let patient = null;

  try {
    patient = await saveDataToDatabase(data, userResponse.user.id);
  } catch (error) {
    console.error("Error saving patient data:", error);
    return NextResponse.json({ message: "Error saving patient data.", error }, { status: 500 });
  }

  return NextResponse.json({ message: "Patient data saved successfully.", data: patient });
}

async function saveDataToDatabase(data, userId) {
  console.log("Saving data to database:", data);

  let studentConnect = undefined;

  if (data.student_id) {
    let student = null;
    try {
      student = await prisma.student.findUnique({
        where: { id: data.student_id }
      });
    } catch (error) {
      console.error("Error finding student:", error);
      throw new Error("Error finding student: " + error.message);
    }
    studentConnect = { connect: { id: student.id } };
  }

  return prisma.patient.create({
    data: {
      student: studentConnect,
      userId: userId,
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
