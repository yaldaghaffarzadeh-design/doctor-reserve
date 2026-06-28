import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateToken } from './app/lib/jwt';

// مسیرهای عمومی (بدون احراز هویت)
const publicPaths = [
  '/',
  '/login.html',
  '/register.html',
  '/landingpage.html',
  '/auth/login',
  '/auth/register',
  '/auth/login-qr',
  '/api/auth/login-password',
  '/api/auth/login-qr',
  '/api/auth/register',
  '/api/doctors',
  '/api/comments',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // اگر مسیر عمومی باشه، اجازه بده
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // اگر فایل استاتیک باشه، اجازه بده
  if (pathname.match(/\.(jpg|jpeg|png|gif|ico|svg|css|js)$/)) {
    return NextResponse.next();
  }
  
  // دریافت توکن
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.split(' ')[1];
  
  if (!token) {
    return NextResponse.redirect(new URL('/login.html', request.url));
  }
  
  const result = validateToken(token);
  
  if (!result.valid) {
    return NextResponse.redirect(new URL('/login.html', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/reserve/:path*',
    '/api/auth/profile',
    '/api/comments',
  ],
};