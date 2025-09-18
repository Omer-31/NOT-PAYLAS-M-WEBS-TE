import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();
export const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  faculty: z.string().min(1),
  department: z.string().min(1),
  classYear: z.string().min(1)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    if (!data.email.endsWith('@erciyes.edu.tr')) {
      return res.status(400).json({ message: 'Sadece erciyes.edu.tr e-postaları kabul edilir.' });
    }

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return res.status(409).json({ message: 'Email zaten kayıtlı.' });

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        faculty: data.faculty,
        department: data.department,
        classYear: data.classYear,
        role: Role.USER
      }
    });

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
    res.json({
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        faculty: user.faculty,
        department: user.department,
        classYear: user.classYear,
        points: user.points,
        profilePictureUrl: user.profilePictureUrl
      }
    });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return res.status(401).json({ message: 'Geçersiz bilgiler' });

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Geçersiz bilgiler' });

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
    res.json({
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        faculty: user.faculty,
        department: user.department,
        classYear: user.classYear,
        points: user.points,
        profilePictureUrl: user.profilePictureUrl
      }
    });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
});

export default router;


