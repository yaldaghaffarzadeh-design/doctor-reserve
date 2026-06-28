import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/app/lib/auth';

async function handler(req: NextRequest, user: any) {
  return NextResponse.json({
    success: true,
    message: 'خروج با موفقیت انجام شد'
  });
}

export const POST = withAuth(handler);