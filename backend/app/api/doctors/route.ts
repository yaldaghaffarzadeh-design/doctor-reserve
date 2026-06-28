import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { Doctor } from '@/app/models/Doctor';

// ✅ هندل کردن OPTIONS (برای CORS)
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

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const doctors = await Doctor.find().sort({ rating: -1 });
    
    return NextResponse.json({
      success: true,
      doctors: doctors
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
    
  } catch (error) {
    console.error('❌ خطا در دریافت پزشکان:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت پزشکان' },
      { status: 500 }
    );
  }
}