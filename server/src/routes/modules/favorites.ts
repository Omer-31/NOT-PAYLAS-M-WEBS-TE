import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../../utils/requireAuth';

const prisma = new PrismaClient();
export const router = Router();

// Create favorite category (defined before parameterized routes to avoid conflicts)
router.post('/categories', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const { name } = req.body;

    console.log('Creating category:', { userId, name });

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Kategori adı gerekli' });
    }

    const category = await prisma.favoriteCategory.create({
      data: { name: name.trim(), userId }
    });

    console.log('Category created:', category);
    res.json(category);
  } catch (e: any) {
    console.error('Error creating category:', e);
    res.status(400).json({ message: e.message });
  }
});

// Get user's favorite categories
router.get('/categories', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;

    console.log('Getting categories for user:', userId);

    const categories = await prisma.favoriteCategory.findMany({
      where: { userId },
      include: {
        _count: {
          select: { favorites: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log('Found categories:', categories);
    res.json(categories);
  } catch (e: any) {
    console.error('Error getting categories:', e);
    res.status(400).json({ message: e.message });
  }
});

// Update favorite category
router.put('/categories/:categoryId', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const categoryId = Number(req.params.categoryId);
    const { name } = req.body;

    if (!Number.isInteger(categoryId)) {
      return res.status(400).json({ message: 'Geçersiz kategori ID' });
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Kategori adı gerekli' });
    }

    const category = await prisma.favoriteCategory.findFirst({
      where: { id: categoryId, userId }
    });

    if (!category) {
      return res.status(404).json({ message: 'Kategori bulunamadı' });
    }

    const updatedCategory = await prisma.favoriteCategory.update({
      where: { id: categoryId },
      data: { name: name.trim() }
    });

    res.json(updatedCategory);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

// Delete favorite category
router.delete('/categories/:categoryId', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const categoryId = Number(req.params.categoryId);

    if (!Number.isInteger(categoryId)) {
      return res.status(400).json({ message: 'Geçersiz kategori ID' });
    }

    const category = await prisma.favoriteCategory.findFirst({
      where: { id: categoryId, userId }
    });

    if (!category) {
      return res.status(404).json({ message: 'Kategori bulunamadı' });
    }

    // Move favorites to uncategorized (set categoryId to null)
    await prisma.favorite.updateMany({
      where: { categoryId, userId },
      data: { categoryId: null }
    });

    // Delete the category
    await prisma.favoriteCategory.delete({
      where: { id: categoryId }
    });

    res.json({ message: 'Kategori silindi' });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

// Add to favorites
router.post('/:noteId', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const noteId = Number(req.params.noteId);
    if (!Number.isInteger(noteId)) {
      return res.status(400).json({ message: 'Geçersiz not ID' });
    }
    const { categoryId } = req.body;

    // Check if note exists
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) {
      return res.status(404).json({ message: 'Not bulunamadı' });
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: { userId_noteId: { userId, noteId } }
    });

    if (existing) {
      return res.status(400).json({ message: 'Bu not zaten favorilerinizde' });
    }

    // If categoryId is provided, verify it belongs to the user
    if (categoryId) {
      const category = await prisma.favoriteCategory.findFirst({
        where: { id: categoryId, userId }
      });
      if (!category) {
        return res.status(404).json({ message: 'Kategori bulunamadı' });
      }
    }

    // Add to favorites
    await prisma.favorite.create({
      data: { userId, noteId, categoryId: categoryId || null }
    });

    res.json({ message: 'Favorilere eklendi' });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

// Remove from favorites
router.delete('/:noteId', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const noteId = Number(req.params.noteId);
    if (!Number.isInteger(noteId)) {
      return res.status(400).json({ message: 'Geçersiz not ID' });
    }

    const favorite = await prisma.favorite.findUnique({
      where: { userId_noteId: { userId, noteId } }
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Bu not favorilerinizde değil' });
    }

    await prisma.favorite.delete({
      where: { userId_noteId: { userId, noteId } }
    });

    res.json({ message: 'Favorilerden çıkarıldı' });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

// Get user's favorites
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;

    console.log('Getting favorites for user:', userId);

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        note: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('Found favorites:', favorites.length);

    // Transform to match frontend expectations
    const baseUrl = process.env.PUBLIC_API_ORIGIN || `http://localhost:${process.env.PORT || 3000}`;
    const transformedFavorites = favorites.map(fav => ({
      id: fav.note.id,
      title: fav.note.title,
      description: fav.note.description,
      course: fav.note.course,
      type: fav.note.type,
      fileUrl: `${baseUrl}/uploads/${fav.note.filePath}`,
      fileName: fav.note.filePath.split('/').pop(),
      fileType: fav.note.fileMime,
      rating: fav.note.avgRating || 0,
      downloads: fav.note.downloadsCount,
      uploader: `${fav.note.user.firstName} ${fav.note.user.lastName}`,
      createdAt: fav.note.createdAt,
      updatedAt: fav.note.updatedAt,
      category: fav.category ? {
        id: fav.category.id,
        name: fav.category.name
      } : null
    }));

    res.json(transformedFavorites);
  } catch (e: any) {
    console.error('Error getting favorites:', e);
    res.status(400).json({ message: e.message });
  }
});

// Create favorite category
router.post('/categories', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const { name } = req.body;

    console.log('Creating category:', { userId, name });

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Kategori adı gerekli' });
    }

    const category = await prisma.favoriteCategory.create({
      data: { name: name.trim(), userId }
    });

    console.log('Category created:', category);
    res.json(category);
  } catch (e: any) {
    console.error('Error creating category:', e);
    res.status(400).json({ message: e.message });
  }
});

// Get user's favorite categories
router.get('/categories', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;

    console.log('Getting categories for user:', userId);

    const categories = await prisma.favoriteCategory.findMany({
      where: { userId },
      include: {
        _count: {
          select: { favorites: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log('Found categories:', categories);
    res.json(categories);
  } catch (e: any) {
    console.error('Error getting categories:', e);
    res.status(400).json({ message: e.message });
  }
});

// Update favorite category
router.put('/categories/:categoryId', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const categoryId = Number(req.params.categoryId);
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Kategori adı gerekli' });
    }

    const category = await prisma.favoriteCategory.findFirst({
      where: { id: categoryId, userId }
    });

    if (!category) {
      return res.status(404).json({ message: 'Kategori bulunamadı' });
    }

    const updatedCategory = await prisma.favoriteCategory.update({
      where: { id: categoryId },
      data: { name: name.trim() }
    });

    res.json(updatedCategory);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

// Delete favorite category
router.delete('/categories/:categoryId', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const categoryId = Number(req.params.categoryId);

    const category = await prisma.favoriteCategory.findFirst({
      where: { id: categoryId, userId }
    });

    if (!category) {
      return res.status(404).json({ message: 'Kategori bulunamadı' });
    }

    // Move favorites to uncategorized (set categoryId to null)
    await prisma.favorite.updateMany({
      where: { categoryId, userId },
      data: { categoryId: null }
    });

    // Delete the category
    await prisma.favoriteCategory.delete({
      where: { id: categoryId }
    });

    res.json({ message: 'Kategori silindi' });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

// Move note to category
router.put('/:noteId/category', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const noteId = Number(req.params.noteId);
    if (!Number.isInteger(noteId)) {
      return res.status(400).json({ message: 'Geçersiz not ID' });
    }
    const { categoryId } = req.body;

    const favorite = await prisma.favorite.findUnique({
      where: { userId_noteId: { userId, noteId } }
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Bu not favorilerinizde değil' });
    }

    // If categoryId is provided, verify it belongs to the user
    if (categoryId) {
      const category = await prisma.favoriteCategory.findFirst({
        where: { id: categoryId, userId }
      });
      if (!category) {
        return res.status(404).json({ message: 'Kategori bulunamadı' });
      }
    }

    await prisma.favorite.update({
      where: { userId_noteId: { userId, noteId } },
      data: { categoryId: categoryId || null }
    });

    res.json({ message: 'Not kategorisi güncellendi' });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
