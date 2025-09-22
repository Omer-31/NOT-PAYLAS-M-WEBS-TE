import { Router } from 'express';
import { PrismaClient, NoteType } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../../utils/requireAuth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();
export const router = Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'note-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Desteklenmeyen dosya türü'));
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Dosya boyutu 10MB\'dan büyük olamaz' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

router.get('/', async (req, res) => {
  const userId = req.query.userId ? Number(req.query.userId) : undefined;
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const course = typeof req.query.course === 'string' ? req.query.course.trim() : '';
  const type = typeof req.query.type === 'string' ? req.query.type.trim() : '';
  const sort = typeof req.query.sort === 'string' ? req.query.sort : 'newest'; // newest | oldest | popular | highest_rated
  const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
  const limit = req.query.limit ? Math.min(50, Math.max(1, Number(req.query.limit))) : 20;
  const skip = (page - 1) * limit;

  const whereClause: any = { isHidden: false };
  if (userId) whereClause.userId = userId;
  if (course) whereClause.course = { contains: course, mode: 'insensitive' };
  if (type) whereClause.type = type as any;
  if (q) {
    whereClause.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { course: { contains: q, mode: 'insensitive' } }
    ];
  }

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'popular') orderBy = { downloadsCount: 'desc' };
  else if (sort === 'highest_rated') orderBy = { avgRating: 'desc' };
  else if (sort === 'oldest') orderBy = { createdAt: 'asc' };

  // Helper: basic Levenshtein similarity for typo-tolerant search
  const lev = (a: string, b: string) => {
    a = a.toLowerCase();
    b = b.toLowerCase();
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[m][n];
  };
  const similarity = (text: string, needle: string) => {
    if (!text) return 0;
    const d = lev(text, needle);
    const denom = Math.max(text.length, needle.length) || 1;
    return 1 - d / denom; // 0..1
  };

  let notes: any[] = [];
  let total = 0;
  if (q) {
    // Broad fetch then fuzzy rank locally
    const MAX_FETCH = 500;
    const raw = await prisma.note.findMany({
      where: whereClause,
      orderBy: sort === 'popular' ? { downloadsCount: 'desc' } : undefined,
      take: MAX_FETCH,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        tags: { include: { tag: true } }
      }
    });
    // Compute score across title/description/course and sort desc
    const scored = raw.map(r => {
      const s = Math.max(
        similarity(r.title || '', q),
        similarity(r.description || '', q),
        similarity(r.course || '', q)
      );
      return { r, s };
    }).sort((a, b) => b.s - a.s);
    total = scored.length;
    const paged = scored.slice(skip, skip + limit).map(x => x.r);
    notes = paged;
  } else {
    const result = await Promise.all([
      prisma.note.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
        include: { 
          user: {
            select: { id: true, firstName: true, lastName: true }
          },
          tags: { include: { tag: true } } 
        }
      }),
      prisma.note.count({ where: whereClause })
    ]);
    notes = result[0];
    total = result[1];
  }
  
  // Transform to match frontend expectations
  const baseUrl = process.env.PUBLIC_API_ORIGIN || `http://localhost:${process.env.PORT || 3000}`;
  const transformedNotes = notes.map(note => ({
    id: note.id,
    title: note.title,
    description: note.description,
    course: note.course,
    type: note.type,
    fileUrl: `${baseUrl}/uploads/${note.filePath}`,
    fileName: note.filePath.split('/').pop(),
    fileType: note.fileMime,
    rating: note.avgRating || 0,
    downloads: note.downloadsCount,
    uploader: `${note.user.firstName} ${note.user.lastName}`,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt
  }));
  
  res.json({ items: transformedNotes, page, limit, total });
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const note = await prisma.note.findUnique({
    where: { id },
    include: { 
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }, 
      tags: { include: { tag: true } } 
    }
  });
  if (!note || note.isHidden) return res.status(404).json({ message: 'Not bulunamadı' });
  
  // Transform to match frontend expectations
  const baseUrl = process.env.PUBLIC_API_ORIGIN || `http://localhost:${process.env.PORT || 3000}`;
  const transformedNote = {
    id: note.id,
    title: note.title,
    description: note.description,
    course: note.course,
    type: note.type,
    fileUrl: `${baseUrl}/uploads/${note.filePath}`,
    fileName: note.filePath.split('/').pop(),
    fileType: note.fileMime,
    rating: note.avgRating || 0,
    downloads: note.downloadsCount,
    uploader: `${note.user.firstName} ${note.user.lastName}`,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    comments: note.comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      user: `${comment.user.firstName} ${comment.user.lastName}`,
      createdAt: comment.createdAt
    }))
  };
  
  res.json(transformedNote);
});

// Download note file: increments downloadsCount then serves file with download headers
router.get('/:id/download', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note || note.isHidden) return res.status(404).json({ message: 'Not bulunamadı' });

    await prisma.note.update({
      where: { id },
      data: { downloadsCount: { increment: 1 } }
    });

    // Set headers to force download instead of opening in browser
    const fileName = note.filePath.split('/').pop() || 'dosya';
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    const baseUrl = process.env.PUBLIC_API_ORIGIN || `http://localhost:${process.env.PORT || 3000}`;
    const fileUrl = `${baseUrl}/uploads/${note.filePath}`;
    return res.redirect(fileUrl);
  } catch (e) {
    return res.status(400).json({ message: 'İndirme sırasında hata oluştu' });
  }
});

// Real file upload route
const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  course: z.string().min(1),
  tags: z.array(z.string()).optional()
});

router.post('/', requireAuth, upload.single('file'), handleMulterError, async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const userId = (req as any).userId as number;
    const data = createSchema.parse(req.body);
    
    if (!req.file) {
      return res.status(400).json({ message: 'Dosya gerekli' });
    }

    // Determine file type
    let fileType: NoteType;
    if (req.file.mimetype === 'application/pdf') {
      fileType = NoteType.pdf;
    } else if (req.file.mimetype.startsWith('image/')) {
      fileType = NoteType.image;
    } else if (req.file.mimetype.includes('word') || req.file.mimetype.includes('document')) {
      fileType = NoteType.doc;
    } else {
      fileType = NoteType.other;
    }

    // Create note
    const note = await prisma.note.create({ 
      data: {
        title: data.title,
        description: data.description,
        course: data.course,
        type: fileType,
        filePath: req.file.filename,
        fileMime: req.file.mimetype,
        fileSize: req.file.size,
        userId
      }
    });

    // Handle tags if provided
    const tagsArray = Array.isArray(data.tags) ? data.tags : [];
    if (tagsArray.length > 0) {
      for (const tagName of tagsArray) {
        if (tagName && typeof tagName === 'string') {
          // Find or create tag
          let tag = await prisma.tag.findUnique({ where: { name: tagName.toLowerCase() } });
          if (!tag) {
            tag = await prisma.tag.create({ data: { name: tagName.toLowerCase() } });
          }
          
          // Connect note to tag
          await prisma.noteTag.create({
            data: {
              noteId: note.id,
              tagId: tag.id
            }
          });
        }
      }
    }

    res.status(201).json({
      id: note.id,
      title: note.title,
      description: note.description,
      course: note.course,
      type: note.type,
      fileUrl: `/uploads/${note.filePath}`,
      fileName: note.filePath,
      fileType: note.fileMime,
      rating: 0,
      downloads: 0,
      uploader: 'Sen',
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});


