import jwt from 'jsonwebtoken';

export const generateToken = (userId, role = 'customer') => {
  const secret = process.env.JWT_SECRET || 'gyaan_fallback_jwt_secret_key_2026';
  const expiresIn = process.env.JWT_EXPIRE || '7d';

  return jwt.sign({ id: userId, role }, secret, {
    expiresIn,
  });
};
