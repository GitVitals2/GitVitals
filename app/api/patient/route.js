import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/patient?cohort={cohort}
 * Retrieve all patients for students in a specific cohort
 *
 * @param {NextRequest} request
 * @returns {NextResponse}
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const cohort = searchParams.get("cohort");

    if (!cohort) return NextResponse.json({ message: "Cohort parameter is required." }, { status: 400 });

    // Fetch students in the specified cohort along with their patients
    const students = await prisma.student.findMany({
      where: { cohort },
      include: {
        patients: {
          include: {
            correctVitals: true
          }
        }
      }
    });

    // Aggregate all patients from the fetched students
    const patients = students.reduce((acc, student) => {
      acc.push(...student.patients);
      return acc;
    }, []);

    return NextResponse.json({ patients });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ message: "Error fetching students.", error }, { status: 500 });
  }
}
