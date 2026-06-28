const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

console.log('📂 مسیر .env.local:', path.join(__dirname, '../.env.local'));
console.log('📌 MONGODB_URI:', process.env.MONGODB_URI);

// مدل Doctor
const DoctorSchema = new mongoose.Schema({
  name: String,
  specialty: String,
  address: String,
  phone: String,
  image: String,
  rating: Number,
  reviewsCount: Number,
  description: String,
  isAvailable: Boolean,
  createdAt: Date
});

const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);

const doctors = [
  {
    name: 'دکتر زهرا وارسته',
    specialty: 'متخصص قلب و عروق',
    address: 'تهران، خیابان ولیعصر',
    phone: '021-12345678',
    image: '/images/dr1.jpg',
    rating: 4.9,
    reviewsCount: 124,
    description: 'متخصص قلب و عروق با ۱۵ سال سابقه',
    isAvailable: true,
    createdAt: new Date('2024-01-15')
  },
  {
    name: 'دکتر علی وارسته',
    specialty: 'متخصص قلب و عروق',
    address: 'تهران، خیابان انقلاب',
    phone: '021-87654321',
    image: '/images/dr2.jpg',
    rating: 4.8,
    reviewsCount: 98,
    description: 'جراح قلب با ۲۰ سال تجربه',
    isAvailable: true,
    createdAt: new Date('2024-02-20')
  },
  {
    name: 'دکتر بهنوش حسینی',
    specialty: 'جراح گوش و حلق و بینی',
    address: 'تهران، خیابان شریعتی',
    phone: '021-98765432',
    image: '/images/dr3.png',
    rating: 4.5,
    reviewsCount: 76,
    description: 'جراح ENT با ۱۰ سال سابقه',
    isAvailable: true,
    createdAt: new Date('2024-03-10')
  },
  {
    name: 'دکتر علی راد',
    specialty: 'متخصص ریه',
    address: 'تهران، خیابان دکتر بهشتی',
    phone: '021-45678901',
    image: '/images/dr4.png',
    rating: 5.0,
    reviewsCount: 256,
    description: 'متخصص بیماری‌های ریوی',
    isAvailable: true,
    createdAt: new Date('2024-04-05')
  },
  {
    name: 'دکتر لعیا زنگنه',
    specialty: 'متخصص قلب و عروق',
    address: 'تهران، خیابان پاسداران',
    phone: '021-11223344',
    image: '/images/dr11.png',
    rating: 4.6,
    reviewsCount: 42,
    description: 'متخصص قلب با ۸ سال سابقه',
    isAvailable: true,
    createdAt: new Date('2024-05-12')
  },
  {
    name: 'دکتر یاشار پناهی',
    specialty: 'متخصص روانشناسی بالینی',
    address: 'تهران، خیابان ستارخان',
    phone: '021-55667788',
    image: '/images/dr12.png',
    rating: 4.9,
    reviewsCount: 18,
    description: 'روانشناس بالینی با ۱۲ سال تجربه',
    isAvailable: true,
    createdAt: new Date('2024-06-20')
  },
  {
    name: 'دکتر زهرا سعادتی',
    specialty: 'متخصص گوش و حلق و بینی',
    address: 'تهران، خیابان فرشته',
    phone: '021-99887766',
    image: '/images/dr13.png',
    rating: 4.4,
    reviewsCount: 35,
    description: 'متخصص ENT با ۷ سال سابقه',
    isAvailable: true,
    createdAt: new Date('2024-07-08')
  },
  {
    name: 'دکتر ماهان گروسی',
    specialty: 'متخصص دندانپزشکی',
    address: 'تهران، خیابان ولیعصر',
    phone: '021-44332211',
    image: '/images/dr14.png',
    rating: 5.0,
    reviewsCount: 56,
    description: 'دندانپزشک با ۱۵ سال تجربه',
    isAvailable: true,
    createdAt: new Date('2024-08-15')
  }
];

async function seedDoctors() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI در .env.local تعریف نشده');
      process.exit(1);
    }

    console.log('📡 اتصال به MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ متصل به MongoDB');

    await Doctor.deleteMany({});
    console.log('🗑️ پزشکان قبلی حذف شدند');

    await Doctor.insertMany(doctors);
    console.log(`✅ ${doctors.length} پزشک با موفقیت اضافه شدند`);

    process.exit(0);
  } catch (error) {
    console.error('❌ خطا:', error);
    process.exit(1);
  }
}

seedDoctors();