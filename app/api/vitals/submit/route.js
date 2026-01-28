import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase.js';

/**
 *
 * @param {NextRequest} request
 * @returns {NextResponse}
 */
export async function POST(request) {
  console.log('Received vitals submission request.');
  const data = await request.json();

  try {
    await saveDataToDatabase(data);
  } catch (error) {
    console.error('Error saving vitals data:', error);
    return NextResponse.json({ message: 'Error saving vitals data.', error }, { status: 500 });
  }

  return NextResponse.json({ message: 'Vitals data saved successfully.' });
}

async function saveDataToDatabase(data) {
  console.log('Saving data to database:', data);

  // TODO: Authenticate user before saving data

  const error = await supabaseAdmin.from('vital_readings').insert([
    {
      entered_by_id: data.entered_by_id,
      entered_by_role: data.entered_by_role,
      patient_id: data.patient_id,
      student_id: data.student_id,
      reading_number: data.reading_number,
      heart_rate: data.heart_rate,
      blood_pressure_sys: data.blood_pressure_systolic,
      blood_pressure_dia: data.blood_pressure_diastolic,
      respiratory_rate: data.respiratory_rate,
      temperature: data.temperature,
      oxygen_saturation: data.oxygen_saturation,
      submitted_at: new Date()
    }
  ]);

  if (error.error) {
    throw new Error(error.error);
  }
}
