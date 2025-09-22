import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../../utils/requireAuth';

const prisma = new PrismaClient();
export const router = Router();

// List threads - scope=cohort|global
router.get('/threads', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const scope = (req.query.scope as string) || 'cohort';

    const me = await prisma.user.findUnique({ where: { id: userId } });
    if (!me) return res.status(401).json({ message: 'Yetkisiz' });

    const where = scope === 'cohort'
      ? {
          user: {
            faculty: me.faculty,
            department: me.department,
            classYear: me.classYear
          }
        }
      : {};

    const threads = await prisma.forumThread.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, faculty: true, department: true, classYear: true } },
        posts: { select: { id: true } }
      }
    });

    const result = threads.map(t => ({
      id: t.id,
      title: t.title,
      body: t.body,
      author: `${t.user.firstName} ${t.user.lastName}`,
      faculty: t.user.faculty,
      department: t.user.department,
      classYear: t.user.classYear,
      replies: t.posts.length,
      createdAt: t.createdAt
    }));

    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

export default router;


