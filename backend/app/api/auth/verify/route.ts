import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { User } from '@/app/models/User';
import { generateToken } from '@/app/lib/jwt';

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
    // اتصال به دیتابیس
    await connectToDatabase();
    
    // دریافت اطلاعات از درخواست
    const body = await req.json();
    const { phone, code } = body;
    
    console.log('📡 تایید کد:', { phone, code });
    
    // اعتبارسنجی
    if (!phone || !code) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'شماره موبایل و کد تایید الزامی است' 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }
    
    if (code.length !== 6) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'کد تایید باید ۶ رقمی باشد' 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }
    
    // پیدا کردن کاربر
    const user = await User.findOne({ phone });
    if (!user) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'کاربر یافت نشد' 
        }),
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }
    
    // ✅ برای سادگی، هر کد ۶ رقمی رو قبول میکنیم
    // در پروژه واقعی باید کد رو با دیتابیس چک کنی
    // و expiration date رو هم بررسی کنی
    
    // ✅ صدور JWT
    const token = generateToken({
      id: user._id.toString(),
      phone: user.phone,
      name: user.name
    });
    
    const data = {
      success: true,
      message: 'تایید با موفقیت انجام شد',
      data: {
        token: token,
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone
        }
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
    console.error('❌ خطا در تایید:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        message: 'خطا در تایید کد' 
      }),
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