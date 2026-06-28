import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { Comment } from '@/app/models/Comment';
import { Doctor } from '@/app/models/Doctor';
import { User } from '@/app/models/User'; // ✅ این خط رو اضافه کن
import jwt from 'jsonwebtoken';

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

// ✅ GET - دریافت نظرات
export async function GET(req: NextRequest) {
  try {
    console.log('📡 اتصال به دیتابیس...');
    await connectToDatabase();
    
    // ✅ مطمئن شو User و Doctor ثبت شدن
    // (با import کردنشون در بالا، ثبت شدن)
    
    console.log('📡 دریافت نظرات...');
    const comments = await Comment.find()
      .populate('userId', 'name')
      .populate('doctorId', 'name specialty')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`✅ ${comments.length} نظر پیدا شد`);
    
    return NextResponse.json({
      success: true,
      comments: comments
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
    
  } catch (error) {
    console.error('❌ خطا در دریافت نظرات:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطا در دریافت نظرات',
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

// ✅ POST - ثبت نظر
export async function POST(req: NextRequest) {
  try {
    console.log('📡 اتصال به دیتابیس...');
    await connectToDatabase();
    
    // دریافت توکن
    const authHeader = req.headers.get('authorization');
    console.log('📌 Auth Header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'احراز هویت لازم است. لطفاً وارد شوید.' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // تایید توکن و گرفتن userId
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      userId = (decoded as any).userId;
      console.log('✅ کاربر تایید شد:', userId);
    } catch (error) {
      console.error('❌ خطا در تایید توکن:', error);
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }
    
    // دریافت اطلاعات نظر
    const body = await req.json();
    const { doctorId, rating, recommend, text } = body;
    
    console.log('📝 دریافت نظر:', { doctorId, rating, recommend, text });
    
    if (!doctorId || !rating || !text) {
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
    
    // ایجاد نظر
    const comment = new Comment({
      userId: user._id,
      doctorId: doctorId,
      text: text,
      rating: rating,
      recommend: recommend || true
    });
    
    await comment.save();
    console.log('✅ نظر ثبت شد:', comment._id);
    
    // به‌روزرسانی امتیاز پزشک
    const doctor = await Doctor.findById(doctorId);
    if (doctor) {
      const allComments = await Comment.find({ doctorId });
      const avgRating = allComments.reduce((sum, c) => sum + c.rating, 0) / allComments.length;
      doctor.rating = Math.round(avgRating * 10) / 10;
      doctor.reviewsCount = allComments.length;
      await doctor.save();
      console.log('✅ امتیاز پزشک به‌روزرسانی شد');
    }
    
    return NextResponse.json({
      success: true,
      message: 'نظر با موفقیت ثبت شد',
      comment: comment
    }, { 
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
    
  } catch (error) {
    console.error('❌ خطا در ثبت نظر:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطا در ثبت نظر',
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