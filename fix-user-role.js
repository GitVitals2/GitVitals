const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUserRole() {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: '123@ensign.edu' },
      include: { students: true }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('Found user:', {
      email: user.email,
      name: user.name,
      currentRole: user.role,
      hasStudentRecord: !!user.students
    });

    // Update role to STUDENT
    const updatedUser = await prisma.user.update({
      where: { email: '123@ensign.edu' },
      data: { role: 'STUDENT' }
    });

    console.log('✅ Updated user role to:', updatedUser.role);

    // Create student record if it doesn't exist
    if (!user.students) {
      const student = await prisma.student.create({
        data: {
          userId: user.id,
          studentId: '123',
          cohort: 'Spring 2026'
        }
      });
      console.log('✅ Created student record:', student.id);
    } else {
      console.log('✅ Student record already exists');
    }

    console.log('\n🎉 All done! User 123@ensign.edu is now a STUDENT');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserRole();
