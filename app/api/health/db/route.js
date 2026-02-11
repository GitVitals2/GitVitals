import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma.js';

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      db: 'connected',
      latencyMs: Date.now() - startedAt
    });
  } catch (error) {
    console.error('DB health check failed:', error);
    return NextResponse.json(
      {
        ok: false,
        db: 'error',
        error: error.message
      },
      { status: 500 }
    );
  }
}
