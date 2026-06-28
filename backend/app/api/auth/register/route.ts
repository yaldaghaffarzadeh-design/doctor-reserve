import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { User } from '@/app/models/User';
import bcrypt from 'bcryptjs';
import { generateQRCode } from '@/app/lib/qr';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { name, phone, password } = body;
    
    if (!name || !phone || !password) {
      return NextResponse.json(
        { success: false, message: 'همه فیلدها الزامی هستند' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'رمز عبور حداقل ۶ کاراکتر باشد' },
        { status: 400 }
      );
    }
    
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'این شماره قبلاً ثبت شده است' },
        { status: 409 }
      );
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      name: name.trim(),
      phone: phone.trim(),
      password: hashedPassword
    });
    
    await user.save();
    
    // تولید QR Code
    const { qrCode, qrSecret } = await generateQRCode(user._id.toString(), user.phone);
    user.qrSecret = qrSecret;
    user.qrCode = qrCode;
    await user.save();
    
    return NextResponse.json({
      success: true,
      message: 'ثبت‌نام با موفقیت انجام شد',
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone
        },
        qrCode: qrCode
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ خطا در ثبت‌نام:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ثبت‌نام' },
      { status: 500 }
    );
  }
}