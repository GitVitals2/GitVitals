import prisma from './lib/prisma.js';

async function reanalyzeSubmission() {
  try {
    // Get the submission for patient "lo"
    const submission = await prisma.vitalReadings.findFirst({
      where: { patient: { name: 'lo' } },
      include: { patient: true },
      orderBy: { submittedAt: 'desc' }
    });

    if (!submission) {
      console.log('❌ No submission found for patient "lo"');
      return;
    }

    console.log('📊 Found submission:', submission.id);
    console.log('Patient:', submission.patient.name, '- Age:', submission.patient.age);

    // Calculate BMI from patient data (we'll need to get height/weight)
    // For now, using default values
    const height_in = 73; // 6'1"
    const weight_lb = 180;
    const bmi = (weight_lb / (height_in * height_in)) * 703;

    // Prepare ML request
    const mlPayload = {
      age_years: submission.patient.age,
      heart_rate: submission.heartRate,
      resp_rate: submission.respiratoryRate || 16,
      temp_f: parseFloat(submission.temperature) || 98.6,
      spo2_pct: submission.oxygenSaturation,
      systolic_bp: submission.bloodPressureSys,
      diastolic_bp: submission.bloodPressureDia,
      height_ft: 6,
      height_in: 1,
      weight_lb: 180,
      pain_0_10: 0
    };

    console.log('\n🤖 Calling ML service...');
    console.log('Payload:', JSON.stringify(mlPayload, null, 2));

    // Call ML service
    const mlResponse = await fetch('http://127.0.0.1:8004/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mlPayload)
    });

    if (!mlResponse.ok) {
      console.log('❌ ML service call failed:', mlResponse.status, mlResponse.statusText);
      return;
    }

    const mlResult = await mlResponse.json();
    console.log('\n✅ ML Result:', JSON.stringify(mlResult, null, 2));

    // Update submission with ML data
    const updated = await prisma.vitalReadings.update({
      where: { id: submission.id },
      data: {
        mlPrediction: mlResult.pred_flag,
        mlRiskScore: mlResult.p_flag || mlResult.risk_probability || 0,
        mlConfidence: mlResult.confidence || 0.95,
        // Don't auto-grade - leave isCorrect as false (pending instructor review)
      }
    });

    console.log('\n🎉 Submission updated successfully!');
    console.log('ML Prediction:', updated.mlPrediction === 0 ? '✅ Normal' : '⚠️ Abnormal');
    console.log('Risk Score:', (parseFloat(updated.mlRiskScore) * 100).toFixed(2) + '%');
    console.log('Confidence:', (parseFloat(updated.mlConfidence) * 100).toFixed(2) + '%');
    console.log('Status: ⏳ Pending instructor approval');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

reanalyzeSubmission();
