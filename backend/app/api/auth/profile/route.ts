import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { User } from '@/app/models/User';
import { withAuth } from '@/app/lib/auth';

async function handler(req: NextRequest, user: any) {
  try {
    await connectToDatabase();
    
    const userData = await User.findById(user.userId).select('-password -qrSecret -__v');
    
    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        user: userData
      }
    });
    
  } catch (error) {
    console.error('❌ خطا:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت اطلاعات' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);