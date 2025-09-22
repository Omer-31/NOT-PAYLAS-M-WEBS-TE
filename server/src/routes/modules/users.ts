import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../../utils/requireAuth';
import { z } from 'zod';

const prisma = new PrismaClient();
export const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    faculty: user.faculty,
    department: user.department,
    classYear: user.classYear,
    points: user.points,
    profilePictureUrl: user.profilePictureUrl,
    themeColor: user.themeColor
  });
});

// Update user profile
const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  faculty: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  classYear: z.string().min(1).optional(),
  themeColor: z.string().optional(),
  profilePictureUrl: z.string().optional()
});

router.put('/me', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const data = updateProfileSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        faculty: true,
        department: true,
        classYear: true,
        points: true,
        profilePictureUrl: true,
        themeColor: true
      }
    });

    res.json(updatedUser);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

export default router;


