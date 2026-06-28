import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { Doctor } from '@/app/models/Doctor';
import mongoose from 'mongoose';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// ✅ روش جایگزین برای گرفتن params
export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    await connectToDatabase();
    
    // گرفتن ID از URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    console.log('📌 دریافت پزشک با ID:', id);
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ ID نامعتبر:', id);
      return NextResponse.json(
        { success: false, message: 'شناسه پزشک نامعتبر است' },
        { 
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' }
        }
      );
    }
    
    const doctor = await Doctor.findById(id);
    
    if (!doctor) {
      console.log('❌ پزشک با این ID یافت نشد:', id);
      return NextResponse.json(
        { success: false, message: 'پزشک یافت نشد' },
        { 
          status: 404,
          headers: { 'Access-Control-Allow-Origin': '*' }
        }
      );
    }
    
    console.log('✅ پزشک پیدا شد:', doctor.name);
    
    return NextResponse.json({
      success: true,
      doctor: doctor
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
    
  } catch (error) {
    console.error('❌ خطا در دریافت پزشک:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطا در دریافت اطلاعات پزشک',
        error: error instanceof Error ? error.message : String(error)
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}