import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../../utils/requireAuth';

const prisma = new PrismaClient();
export const router = Router();

// Add comment to a note
const addCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.number().optional()
});

router.post('/:noteId', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const noteId = Number(req.params.noteId);
    const data = addCommentSchema.parse(req.body);

    // Check if note exists
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) {
      return res.status(404).json({ message: 'Not bulunamadı' });
    }

    // If parentId provided, check if parent comment exists
    if (data.parentId) {
      const parentComment = await prisma.comment.findUnique({ 
        where: { id: data.parentId },
        include: { note: true }
      });
      if (!parentComment || parentComment.noteId !== noteId) {
        return res.status(400).json({ message: 'Geçersiz üst yorum' });
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        noteId,
        userId,
        parentId: data.parentId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Transform to match frontend expectations
    const transformedComment = {
      id: comment.id,
      content: comment.content,
      user: `${comment.user.firstName} ${comment.user.lastName}`,
      createdAt: comment.createdAt
    };

    res.status(201).json(transformedComment);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

// Delete comment
router.delete('/:commentId', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const commentId = Number(req.params.commentId);

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }

    // Check if user owns the comment
    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'Bu yorumu silme yetkiniz yok' });
    }

    await prisma.comment.delete({ where: { id: commentId } });

    res.json({ message: 'Yorum silindi' });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

// Update comment
const updateCommentSchema = z.object({
  content: z.string().min(1).max(1000)
});

router.put('/:commentId', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const commentId = Number(req.params.commentId);
    const data = updateCommentSchema.parse(req.body);

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }

    // Check if user owns the comment
    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'Bu yorumu düzenleme yetkiniz yok' });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: data.content },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Transform to match frontend expectations
    const transformedComment = {
      id: updatedComment.id,
      content: updatedComment.content,
      user: `${updatedComment.user.firstName} ${updatedComment.user.lastName}`,
      createdAt: updatedComment.createdAt
    };

    res.json(transformedComment);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
