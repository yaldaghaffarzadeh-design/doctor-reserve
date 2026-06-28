import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { User } from '@/app/models/User';
import { Doctor } from '@/app/models/Doctor';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// مدل Appointment
const AppointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  referrer: { type: String, default: 'self' },
  trackingCode: { type: String, required: true },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);

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

// ✅ دریافت لیست نوبت‌های کاربر
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'احراز هویت لازم است' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      userId = decoded.userId;
      console.log('✅ کاربر تایید شد:', userId);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }
    
    // ✅ دریافت نوبت‌های کاربر از دیتابیس
    const appointments = await Appointment.find({ userId })
      .populate('doctorId', 'name specialty address image')
      .sort({ createdAt: -1 });
    
    console.log(`✅ ${appointments.length} نوبت پیدا شد`);
    
    return NextResponse.json({
      success: true,
      appointments: appointments
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
    
  } catch (error) {
    console.error('❌ خطا در دریافت نوبت‌ها:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطا در دریافت نوبت‌ها',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// ✅ ثبت نوبت جدید
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'احراز هویت لازم است. لطفاً وارد شوید.' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      userId = decoded.userId;
      console.log('✅ کاربر تایید شد:', userId);
    } catch (error) {
      console.error('❌ خطا در تایید توکن:', error);
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { doctorId, date, time, referrer } = body;
    
    console.log('📝 ثبت نوبت:', { doctorId, date, time, referrer });
    
    if (!doctorId || !date || !time) {
      return NextResponse.json(
        { success: false, message: 'همه فیلدها الزامی است' },
        { status: 400 }
      );
    }
    
    // بررسی وجود کاربر
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }
    
    // بررسی وجود پزشک
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: 'پزشک یافت نشد' },
        { status: 404 }
      );
    }
    
    // ✅ ایجاد کد پیگیری
    const trackingCode = Math.floor(10000000 + Math.random() * 90000000).toString();
    
    // ✅ ذخیره نوبت در دیتابیس
    const appointment = new Appointment({
      userId: userId,
      doctorId: doctorId,
      date: date,
      time: time,
      referrer: referrer || 'self',
      trackingCode: trackingCode,
      status: 'active'
    });
    
    await appointment.save();
    console.log('✅ نوبت با موفقیت ثبت شد برای:', user.name);
    
    return NextResponse.json({
      success: true,
      message: 'نوبت با موفقیت ثبت شد',
      appointment: appointment
    }, { 
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
    
  } catch (error) {
    console.error('❌ خطا در ثبت نوبت:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطا در ثبت نوبت',
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

// ✅ لغو نوبت
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'احراز هویت لازم است' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }
    
    // گرفتن ID از URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'شناسه نوبت الزامی است' },
        { status: 400 }
      );
    }
    
    // پیدا کردن نوبت
    const appointment = await Appointment.findOne({ _id: id, userId });
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'نوبت یافت نشد' },
        { status: 404 }
      );
    }
    
    // لغو نوبت
    appointment.status = 'cancelled';
    await appointment.save();
    
    console.log('✅ نوبت لغو شد:', id);
    
    return NextResponse.json({
      success: true,
      message: 'نوبت با موفقیت لغو شد'
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
    
  } catch (error) {
    console.error('❌ خطا در لغو نوبت:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در لغو نوبت' },
      { status: 500 }
    );
  }
}