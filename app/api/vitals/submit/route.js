import { NextRequest, NextResponse } from 'next/server';

/**
 *
 * @param {NextRequest} request
 * @returns {NextResponse}
 */
export async function POST(request) {
  const data = await request.json();

  try {
    saveDataToDatabase(data);
    const mlUrl = process.env.ML_API_URL || 'http://127.0.0.1:8004/predict';
    const mlResponse = await fetch(mlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      return NextResponse.json(
        { message: 'Prediction failed', error: errorText },
        { status: 502 }
      );
    }

    const prediction = await mlResponse.json();
    return NextResponse.json({ message: 'Vitals data saved successfully.', prediction });
  } catch (error) {
    return NextResponse.json({ message: 'Error saving vitals data.', error: error.message }, { status: 500 });
  }
}

function saveDataToDatabase(data) {
  // Placeholder function to simulate database saving logic
  console.log('Saving data to database:', data);
}
