import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../../utils/requireAuth';

const prisma = new PrismaClient();
export const router = Router();

// Rate a note
const rateSchema = z.object({
  score: z.number().int().min(1).max(5)
});

router.post('/:noteId', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const noteId = Number(req.params.noteId);
    const data = rateSchema.parse(req.body);

    // Check if note exists
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) {
      return res.status(404).json({ message: 'Not bulunamadı' });
    }

    // Check if user already rated this note
    const existingRating = await prisma.rating.findUnique({
      where: { noteId_userId: { noteId, userId } }
    });

    if (existingRating) {
      // Update existing rating
      await prisma.rating.update({
        where: { id: existingRating.id },
        data: { score: data.score }
      });
    } else {
      // Create new rating
      await prisma.rating.create({
        data: { noteId, userId, score: data.score }
      });
    }

    // Calculate new average rating
    const ratings = await prisma.rating.findMany({ where: { noteId } });
    const avgRating = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;

    // Update note's average rating
    await prisma.note.update({
      where: { id: noteId },
      data: { avgRating: Math.round(avgRating * 10) / 10 }
    });

    res.json({ message: 'Puanlama başarılı', avgRating: Math.round(avgRating * 10) / 10 });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

// Get user's rating for a note
router.get('/:noteId', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const noteId = Number(req.params.noteId);

    const rating = await prisma.rating.findUnique({
      where: { noteId_userId: { noteId, userId } }
    });

    res.json({ rating: rating?.score || null });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
