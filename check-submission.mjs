import prisma from './lib/prisma.js';

async function checkSubmission() {
  try {
    const submissions = await prisma.vitalReadings.findMany({
      where: { patient: { name: 'lo' } },
      include: { patient: true },
      orderBy: { submittedAt: 'desc' },
      take: 1
    });

    console.log('Submission data:');
    console.log(JSON.stringify(submissions, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkSubmission();
