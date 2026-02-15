import prisma from './lib/prisma.js';

async function switchToInstructor() {
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

    console.log('✅ Found user:', {
      email: user.email,
      name: user.name,
      currentRole: user.role,
      hasStudentRecord: !!user.students
    });

    // Update role to INSTRUCTOR
    const updatedUser = await prisma.user.update({
      where: { email: '123@ensign.edu' },
      data: { role: 'INSTRUCTOR' }
    });

    console.log('✅ Updated user role to:', updatedUser.role);
    console.log('\n🎉 SUCCESS! User 123@ensign.edu is now an INSTRUCTOR\n');
    console.log('The user now has access to:');
    console.log('  - Instructor Dashboard');
    console.log('  - Review Queue for student submissions');
    console.log('  - Grade submissions');
    console.log('\nPlease log out and log back in to see the changes!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

switchToInstructor();
