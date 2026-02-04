const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  engineType: 'binary',
});

async function main() {
  console.log('🌱 Starting seed...');
  console.log('⚠️  Note: This seed script creates data directly in the database.');
  console.log('⚠️  Supabase Auth integration is disabled for testing.');

  // Use raw SQL to bypass auth foreign key constraint temporarily
  // Or we can create test data that you can view in the API

  // For now, let's just create some patients and vitals using existing user IDs
  // First, let's check if there are any users
  const existingUsers = await prisma.user.findMany({ take: 5 });
  
  if (existingUsers.length === 0) {
    console.log('❌ No users found in database.');
    console.log('💡 You need to create users through Supabase Auth first.');
    console.log('💡 Then run this seed script again to add test data.');
    return;
  }

  console.log(`✓ Found ${existingUsers.length} existing user(s)`);
  
  // Use first user as instructor, rest as students
  const instructorUser = existingUsers.find(u => u.role === 'INSTRUCTOR') || existingUsers[0];
  const studentUsers = existingUsers.filter(u => u.role === 'STUDENT').slice(0, 3);

  console.log(`Using instructor: ${instructorUser.email}`);
  console.log(`Using ${studentUsers.length} student(s)`);

  // Create or find student profiles
  const students = [];
  for (let i = 0; i < studentUsers.length; i++) {
    const student = await prisma.student.upsert({
      where: { userId: studentUsers[i].id },
      update: {},
      create: {
        userId: studentUsers[i].id,
        studentId: `S00${i + 1}`,
        cohort: i < 2 ? 'Fall2025' : 'Spring2026'
      }
    });
    students.push(student);
  }
  console.log(`✓ Created/updated ${students.length} student profile(s)`);

  // Create patients for each student
  for (let i = 0; i < students.length; i++) {
    const patient = await prisma.patient.create({
      data: {
        studentId: students[i].id,
        userId: studentUsers[i].id,
        name: `Test Patient ${i + 1}`,
        relationship: i % 2 === 0 ? 'CLASSMATE' : 'FAMILY_MEMBER',
        age: 20 + i * 5,
        gender: i % 2 === 0 ? 'Female' : 'Male'
      }
    });

    // Create correct vitals for this patient
    await prisma.correctVital.create({
      data: {
        patientId: patient.id,
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        heartRate: 70 + i * 2,
        temperature: 98.6,
        respiratoryRate: 16,
        oxygenSaturation: 98,
        createdById: instructorUser.id
      }
    });

    // Create a vital reading submission
    await prisma.vitalReading.create({
      data: {
        patientId: patient.id,
        studentId: students[i].id,
        enteredById: studentUsers[i].id,
        enteredByRole: 'STUDENT',
        readingNumber: 1,
        bloodPressureSystolic: 120 + (i % 2 === 0 ? 0 : 2),
        bloodPressureDiastolic: 80,
        heartRate: 70 + i * 2,
        temperature: 98.6,
        respiratoryRate: 16,
        oxygenSaturation: 98,
        isCorrect: i % 2 === 0
      }
    });
  }

  console.log(`✓ Created ${students.length} patient(s) with vitals`);
  console.log('🎉 Seed completed successfully!');
  console.log('\n📊 Test the API at: http://localhost:3000/api/instructor/submissions');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
