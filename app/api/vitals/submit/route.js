import { NextRequest, NextResponse } from 'next/server';

/**
 * POST handler for vitals submission.
 * Forwards the payload to the ML prediction API and returns the result.
 *
 * @param {NextRequest} request
 * @returns {NextResponse}
 */
export async function POST(request) {
  const data = await request.json();

  try {
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
    return NextResponse.json({ message: 'Vitals data submitted successfully.', prediction });
  } catch (error) {
    return NextResponse.json(
      { message: 'Unable to process vitals submission.', error: error.message },
      { status: 500 }
    );
  }
}
