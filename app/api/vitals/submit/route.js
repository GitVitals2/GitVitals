import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  const data = await request.json();
  const { userEmail, patientName, ...vitalsData } = data;

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { students: true }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.students) {
      return NextResponse.json(
        { message: 'Student record not found for this user' },
        { status: 404 }
      );
    }

    let patient = await prisma.patient.findFirst({
      where: { 
        name: patientName,
        OR: [
          { studentId: user.students.id },
          { userId: user.id }
        ]
      }
    });

    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          name: patientName,
          studentId: user.students.id,
          userId: user.id,
          age: Math.round(vitalsData.age_years),
          isBaselineSet: false
        }
      });
    }

    const mlPayload = {
      age_years: vitalsData.age_years,
      heart_rate: vitalsData.heart_rate,
      resp_rate: vitalsData.resp_rate,
      temp_f: vitalsData.temp_f,
      spo2_pct: vitalsData.spo2_pct,
      systolic_bp: vitalsData.systolic_bp,
      diastolic_bp: vitalsData.diastolic_bp,
      height_ft: vitalsData.height_ft,
      height_in: vitalsData.height_in,
      weight_lb: vitalsData.weight_lb,
      pain_0_10: vitalsData.pain_0_10,
    };

    const mlUrl = process.env.PREDICTION_API_URL || 'http://127.0.0.1:8004/predict';
    let prediction = null;
    let mlPrediction = null;
    let mlRiskScore = null;
    let mlConfidence = null;
    
    try {
      const mlResponse = await fetch(mlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mlPayload),
      });

      if (mlResponse.ok) {
        prediction = await mlResponse.json();
        mlPrediction = prediction.pred || 0;
        mlRiskScore = prediction.risk_probability || 0;
        mlConfidence = Math.abs((prediction.risk_probability || 0.5) - 0.5) * 2;
      }
    } catch (mlError) {
      console.warn('Prediction service unavailable, continuing without analysis');
    }

    const lastReading = await prisma.vitalReadings.findFirst({
      where: { 
        patientId: patient.id,
        studentId: user.students.id 
      },
      orderBy: { readingNumber: 'desc' }
    });

    const nextReadingNumber = lastReading ? lastReading.readingNumber + 1 : 1;

    const totalInches = (parseFloat(vitalsData.height_ft) * 12) + parseFloat(vitalsData.height_in);
    const heightInMeters = totalInches * 0.0254;
    const weightInKg = parseFloat(vitalsData.weight_lb) * 0.453592;
    const bmi = weightInKg / (heightInMeters * heightInMeters);

    const vitalReading = await prisma.vitalReadings.create({
      data: {
        enteredById: user.id,
        enteredByRole: user.role,
        patientId: patient.id,
        studentId: user.students.id,
        readingNumber: nextReadingNumber,
        heartRate: Math.round(vitalsData.heart_rate),
        bloodPressureSys: Math.round(vitalsData.systolic_bp),
        bloodPressureDia: Math.round(vitalsData.diastolic_bp),
        respiratoryRate: Math.round(vitalsData.resp_rate),
        temperature: parseFloat(vitalsData.temp_f).toFixed(1),
        oxygenSaturation: Math.round(vitalsData.spo2_pct),
        submittedAt: new Date(),
        isCorrect: false, // Always pending - instructor must approve
        mlPrediction: mlPrediction,
        mlRiskScore: mlRiskScore,
        mlConfidence: mlConfidence
      }
    });

    return NextResponse.json({ 
      message: 'Vitals submitted successfully',
      prediction,
      reading: {
        id: vitalReading.id,
        readingNumber: vitalReading.readingNumber,
        patientName: patient.name,
        bmi: bmi.toFixed(1)
      }
    });

  } catch (error) {
    console.error('Vitals submission error:', error);
    return NextResponse.json(
      { message: 'Unable to process vitals submission', error: error.message },
      { status: 500 }
    );
  }
}
