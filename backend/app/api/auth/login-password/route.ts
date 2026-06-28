import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { User } from '@/app/models/User';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/app/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { phone, password } = body;
    
    if (!phone || !password) {
      return NextResponse.json(
        { success: false, message: 'شماره موبایل و رمز عبور الزامی است' },
        { status: 400 }
      );
    }
    
    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }
    
    if (user.isLocked && user.isLocked()) {
      const remaining = Math.ceil((user.lockedUntil - new Date()) / 60000);
      return NextResponse.json(
        { 
          success: false, 
          message: `حساب کاربری قفل شده. ${remaining} دقیقه دیگر تلاش کنید`,
          code: 'ACCOUNT_LOCKED'
        },
        { status: 403 }
      );
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      if (user.incrementLoginAttempts) {
        await user.incrementLoginAttempts();
      }
      return NextResponse.json(
        { success: false, message: 'رمز عبور اشتباه است' },
        { status: 401 }
      );
    }
    
    if (user.resetLoginAttempts) {
      await user.resetLoginAttempts();
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    const token = generateToken({
      id: user._id.toString(),
      phone: user.phone,
      name: user.name
    });
    
    return NextResponse.json({
      success: true,
      message: 'ورود با موفقیت انجام شد',
      data: {
        token: token,
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone
        }
      }
    });
    
  } catch (error) {
    console.error('❌ خطا در ورود:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ورود به سیستم' },
      { status: 500 }
    );
  }
}