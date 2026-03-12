export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'carrefour-vip-super-secret-key',
  expiresIn: '7d',
};
