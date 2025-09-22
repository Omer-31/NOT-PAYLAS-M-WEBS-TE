import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const router = Router();

router.get('/', async (_req, res) => {
  try {
    // Get users with their notes and ratings
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        notes: {
          select: {
            downloadsCount: true,
            avgRating: true,
            ratings: {
              select: { score: true }
            }
          }
        }
      }
    });

    // Calculate leaderboard data
    const leaderboardData = users.map(user => {
      const totalNotes = user.notes.length;
      const totalDownloads = user.notes.reduce((sum, note) => sum + note.downloadsCount, 0);
      const avgRating = user.notes.length > 0 
        ? user.notes.reduce((sum, note) => sum + (note.avgRating || 0), 0) / user.notes.length 
        : 0;

      // Points = toplam verilen yıldız sayısı (tüm notlarına gelen score toplamı)
      const starSum = user.notes.reduce((sum, note) => sum + note.ratings.reduce((s, r) => s + r.score, 0), 0);
      const computedPoints = starSum;

      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        points: computedPoints,
        notesCount: totalNotes,
        totalDownloads,
        avgRating: Math.round(avgRating * 10) / 10
      };
    });

    // Sort by points (descending), then by notes count, then by downloads
    leaderboardData.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.notesCount !== a.notesCount) return b.notesCount - a.notesCount;
      return b.totalDownloads - a.totalDownloads;
    });

    res.json(leaderboardData);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Liderlik tablosu yüklenirken hata oluştu' });
  }
});

export default router;
