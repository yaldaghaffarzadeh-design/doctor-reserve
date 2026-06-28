import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { User } from '@/app/models/User';
import bcrypt from 'bcryptjs';
import { generateQRCodeWithCode } from '@/app/lib/qr';

// ✅ هندل کردن OPTIONS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { phone } = body;
    
    if (!phone) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'شماره موبایل الزامی است' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }
    
    // پیدا کردن یا ایجاد کاربر
    let user = await User.findOne({ phone });
    
    if (!user) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      user = new User({
        name: `کاربر ${phone}`,
        phone: phone,
        password: hashedPassword
      });
      await user.save();
    }
    
    // ✅ تولید کد ۶ رقمی
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // ✅ تولید QR Code با کد توی خودش
    const qrCode = await generateQRCodeWithCode(phone, code);
    
    // ذخیره کد توی دیتابیس (برای تایید بعدی)
    // برای سادگی، فعلاً توی حافظه ذخیره میکنیم
    // در پروژه واقعی باید توی دیتابیس ذخیره بشه
    
    const data = {
      success: true,
      message: 'QR Code با موفقیت تولید شد',
      data: {
        qrCode: qrCode,
        userId: user._id
        // ❌ code رو حذف کردیم
      }
    };
    
    return new NextResponse(
      JSON.stringify(data),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
        }
      }
    );
    
  } catch (error) {
    console.error('❌ خطا:', error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'خطا در تولید QR Code' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}