import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../../utils/requireAuth';

const prisma = new PrismaClient();
export const router = Router();

// Get all active announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { isActive: true },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    const transformedAnnouncements = announcements.map(announcement => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      author: `${announcement.author.firstName} ${announcement.author.lastName}`,
      isPinned: announcement.isPinned,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt
    }));

    res.json(transformedAnnouncements);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// Create announcement (admin only)
const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(2000),
  isPinned: z.boolean().optional()
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const data = createAnnouncementSchema.parse(req.body);

    // Check if user is admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        authorId: userId,
        isPinned: data.isPinned || false
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    const transformedAnnouncement = {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      author: `${announcement.author.firstName} ${announcement.author.lastName}`,
      isPinned: announcement.isPinned,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt
    };

    res.status(201).json(transformedAnnouncement);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

// Update announcement (admin only)
const updateAnnouncementSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(2000).optional(),
  isPinned: z.boolean().optional(),
  isActive: z.boolean().optional()
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const announcementId = Number(req.params.id);
    const data = updateAnnouncementSchema.parse(req.body);

    // Check if user is admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    const announcement = await prisma.announcement.findUnique({ where: { id: announcementId } });
    if (!announcement) {
      return res.status(404).json({ message: 'Duyuru bulunamadı' });
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: announcementId },
      data,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    const transformedAnnouncement = {
      id: updatedAnnouncement.id,
      title: updatedAnnouncement.title,
      content: updatedAnnouncement.content,
      author: `${updatedAnnouncement.author.firstName} ${updatedAnnouncement.author.lastName}`,
      isPinned: updatedAnnouncement.isPinned,
      createdAt: updatedAnnouncement.createdAt,
      updatedAt: updatedAnnouncement.updatedAt
    };

    res.json(transformedAnnouncement);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

// Delete announcement (admin only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const announcementId = Number(req.params.id);

    // Check if user is admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    const announcement = await prisma.announcement.findUnique({ where: { id: announcementId } });
    if (!announcement) {
      return res.status(404).json({ message: 'Duyuru bulunamadı' });
    }

    await prisma.announcement.delete({ where: { id: announcementId } });

    res.json({ message: 'Duyuru silindi' });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
