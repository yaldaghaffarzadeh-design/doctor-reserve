const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

console.log('📂 مسیر .env.local:', path.join(__dirname, '../.env.local'));
console.log('📌 MONGODB_URI:', process.env.MONGODB_URI);

// مدل‌ها
const UserSchema = new mongoose.Schema({
  name: String,
  phone: String,
  password: String
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const DoctorSchema = new mongoose.Schema({
  name: String
});
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);

const CommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  text: String,
  rating: Number,
  recommend: Boolean,
  createdAt: Date
});
const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);

async function seedComments() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI در .env.local تعریف نشده');
      process.exit(1);
    }

    console.log('📡 اتصال به MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ متصل به MongoDB');

    // پیدا کردن کاربر
    const user = await User.findOne();
    if (!user) {
      console.log('❌ کاربری یافت نشد. لطفاً اول ثبت‌نام کنید.');
      console.log('💡 از طریق login.html ثبت‌نام کن');
      process.exit(1);
    }
    console.log(`👤 کاربر پیدا شد: ${user.name}`);

    // پیدا کردن پزشکان
    const doctors = await Doctor.find();
    if (doctors.length === 0) {
      console.log('❌ پزشکی یافت نشد. لطفاً اول seed-doctors رو اجرا کن.');
      process.exit(1);
    }
    console.log(`👨‍⚕️ ${doctors.length} پزشک پیدا شد`);

    const comments = [
      {
        userId: user._id,
        doctorId: doctors[0]._id,
        text: 'سلام دکتر بسیار خون گرم و مهربون بود',
        rating: 5,
        recommend: true,
        createdAt: new Date('2024-05-25')
      },
      {
        userId: user._id,
        doctorId: doctors[1]._id,
        text: 'نوبت‌دهی آنلاین خیلی راحت بود. پزشک متخصص و با تجربه‌ای بود.',
        rating: 5,
        recommend: true,
        createdAt: new Date('2024-05-23')
      },
      {
        userId: user._id,
        doctorId: doctors[2]._id,
        text: 'واقعاً راضی بودم. از همان ابتدای ورود تا پایان ویزیت، همه چیز عالی بود.',
        rating: 5,
        recommend: true,
        createdAt: new Date('2024-05-20')
      }
    ];

    await Comment.deleteMany({});
    console.log('🗑️ نظرات قبلی حذف شدند');

    await Comment.insertMany(comments);
    console.log(`✅ ${comments.length} نظر با موفقیت اضافه شدند`);

    process.exit(0);
  } catch (error) {
    console.error('❌ خطا:', error);
    process.exit(1);
  }
}

seedComments();