import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from './jwt';

// ✅ Middleware برای محافظت از API Routes
export function withAuth(handler: Function) {
  return async (req: NextRequest) => {
    try {
      const authHeader = req.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'لطفاً وارد حساب کاربری خود شوید',
            code: 'NO_TOKEN' 
          },
          { status: 401 }
        );
      }
      
      const token = authHeader.split(' ')[1];
      const result = validateToken(token);
      
      if (!result.valid) {
        return NextResponse.json(
          { 
            success: false, 
            message: result.message,
            code: result.code 
          },
          { status: result.code === 'TOKEN_EXPIRED' ? 401 : 403 }
        );
      }
      
      return handler(req, result.decoded);
      
    } catch (error) {
      console.error('❌ خطا در احراز هویت:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در احراز هویت' },
        { status: 500 }
      );
    }
  };
}