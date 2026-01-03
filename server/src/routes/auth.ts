import { Router } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signToken } from '../utils/auth';

export function authRouter(prisma: PrismaClient) {
  const router = Router();

  router.post('/login', async (req, res) => {
    const { email, password } = req.body || {};
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    if (![UserRole.admin, UserRole.vendor].includes(user.role)) {
      return res.status(403).json({ error: 'Only admin/vendor can sign in' });
    }
    const token = signToken({ userId: user.id, role: user.role });
    res.cookie('auth', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 24 * 3600 * 1000 });
    const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
    return res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, vendor });
  });

  router.post('/logout', (req, res) => {
    res.clearCookie('auth');
    res.json({ success: true });
  });

  return router;
}
