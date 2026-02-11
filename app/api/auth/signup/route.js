import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signUpUser } from '@/lib/supabase';

/**
 * POST /api/auth/signup
 * Register a new user using Supabase auth and create profile with Prisma
 * 
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function POST(request) {
  try {
    const { email, password, name, studentId, role } = await request.json();

    // Validate input
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { success: false, error: 'Email, password, name, and role are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['student', 'instructor'];
    if (!validRoles.includes(role.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Must be student or instructor' },
        { status: 400 }
      );
    }

    // Validate student ID for students
    if (role.toLowerCase() === 'student' && !studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required for students' },
        { status: 400 }
      );
    }

    // Convert role to uppercase for Prisma enum
    const userRole = role.toUpperCase();

    console.log('[SIGNUP] Step 1: Creating auth user...');
    // Create user in Supabase Auth and Users table
    const authResult = await signUpUser({
      email,
      password,
      name,
      role: userRole,
      canvasId: studentId || null,
      skipProfile: true,
    });

    if (!authResult.success) {
      console.error('[SIGNUP] Auth failed:', authResult.error);
      return NextResponse.json(
        { success: false, error: authResult.error || 'Registration failed' },
        { status: 400 }
      );
    }

    const userId = authResult.user.id;
    console.log('[SIGNUP] Step 2: Auth user created, ID:', userId);

    const canvasIdValue = role.toLowerCase() === 'student' ? studentId : null;

    try {
      console.log('[SIGNUP] Step 3: Upserting user profile...');
      await prisma.user.upsert({
        where: { id: userId },
        update: {
          email: email,
          name: name,
          role: userRole,
          canvasId: canvasIdValue,
        },
        create: {
          id: userId,
          email: email,
          name: name,
          role: userRole,
          canvasId: canvasIdValue,
        },
      });
      console.log('[SIGNUP] Step 3: User profile created');
    } catch (prismaError) {
      console.error('[SIGNUP] Prisma user upsert failed:', prismaError);
      throw new Error(`Database error saving user profile: ${prismaError.message}`);
    }

    // If role is student, create student record
    if (role.toLowerCase() === 'student') {
      const studentData = {
        userId: userId,
        studentId: studentId,
      };

      try {
        console.log('[SIGNUP] Step 4: Creating student record...');
        await prisma.student.create({
          data: studentData,
        });
        console.log('[SIGNUP] Step 4: Student record created');
      } catch (prismaError) {
        console.error('[SIGNUP] Prisma student create failed:', prismaError);
        throw new Error(`Database error saving student record: ${prismaError.message}`);
      }
    }

    // Fetch complete user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        students: {
          select: {
            id: true,
            studentId: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: user,
        message: 'Registration successful',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
