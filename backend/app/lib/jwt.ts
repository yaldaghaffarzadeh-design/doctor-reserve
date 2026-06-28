import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ✅ تولید JWT
export function generateToken(user: { id: string; phone: string; name: string }) {
  return jwt.sign(
    {
      userId: user.id,
      phone: user.phone,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// ✅ تایید JWT
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// ✅ بررسی اعتبار JWT
export function validateToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, decoded };
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return { valid: false, message: 'توکن منقضی شده است', code: 'TOKEN_EXPIRED' };
    }
    if (error.name === 'JsonWebTokenError') {
      return { valid: false, message: 'توکن نامعتبر است', code: 'INVALID_TOKEN' };
    }
    return { valid: false, message: 'خطا در تایید توکن', code: 'TOKEN_ERROR' };
  }
}