import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signInUser } from '@/lib/supabase';

/**
 * POST /api/auth/login
 * Login user using Supabase auth, then fetch profile with Prisma
 * 
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate with Supabase first
    const authResult = await signInUser(email, password);

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentication failed' },
        { status: 401 }
      );
    }

    // Fetch user profile using Prisma with auth user id
    const userId = authResult?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        canvasId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Return success with user data from Prisma and session from Supabase
    return NextResponse.json({
      success: true,
      user: {
        ...user,
        // Include session from Supabase auth
        session: authResult.session,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
}
