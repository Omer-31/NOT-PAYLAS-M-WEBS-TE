import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

type PopularCache = {
  computedAt: string; // ISO
  items: Array<{
    id: number;
    score: number;
    title: string;
    description: string;
    course: string;
    type: string | null;
    filePath: string;
    fileMime: string | null;
    avgRating: number | null;
    downloadsCount: number;
    viewsCount: number;
    createdAt: string;
    uploader: { id: number; firstName: string | null; lastName: string | null } | null;
  }>;
};

const prisma = new PrismaClient();
export const router = Router();

const CACHE_PATH = path.join(process.cwd(), 'src', 'data', 'popular_daily.json');
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

async function buildPopularCache(): Promise<PopularCache> {
  const notes = await prisma.note.findMany({
    where: { isHidden: false },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  // Gather max values for normalization
  let maxDownloads = 1;
  let maxViews = 1;
  for (const n of notes) {
    maxDownloads = Math.max(maxDownloads, n.downloadsCount || 0);
    // viewsCount may not exist in schema; coalesce
    // @ts-ignore
    const views = (n as any).viewsCount ?? 0;
    maxViews = Math.max(maxViews, views);
  }

  const W_DOWNLOADS = 0.5;
  const W_LIKE = 0.3; // using rating ratio (avgRating / 5)
  const W_VIEWS = 0.2;

  const items = notes
    .map((n) => {
      const downloads = n.downloadsCount || 0;
      // @ts-ignore
      const views: number = (n as any).viewsCount ?? 0;
      const likeRatio = Math.max(0, Math.min(1, (n.avgRating || 0) / 5));
      const created = n.createdAt instanceof Date ? n.createdAt : new Date(n.createdAt as any);
      const daysSince = Math.max(0, (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
      const recencyBoost = Math.max(0, 20 - daysSince); // subtle freshness bonus

      const score =
        W_DOWNLOADS * (downloads / (maxDownloads || 1)) +
        W_LIKE * likeRatio +
        W_VIEWS * (views / (maxViews || 1)) +
        0.05 * recencyBoost; // tiny recency weight

      return {
        id: n.id,
        score,
        title: n.title,
        description: n.description || '',
        course: n.course || '',
        type: (n as any).type || null,
        filePath: n.filePath,
        fileMime: n.fileMime || null,
        avgRating: n.avgRating || 0,
        downloadsCount: downloads,
        viewsCount: views,
        createdAt: created.toISOString(),
        uploader: n.user ? { id: n.user.id, firstName: n.user.firstName, lastName: n.user.lastName } : null,
      };
    })
    .sort((a, b) => b.score - a.score);

  const cache: PopularCache = {
    computedAt: new Date().toISOString(),
    items,
  };

  try {
    fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
  } catch {}

  return cache;
}

function isCacheStale(cache: PopularCache | null) {
  if (!cache) return true;
  const ts = new Date(cache.computedAt).getTime();
  return isNaN(ts) || Date.now() - ts > ONE_DAY_MS;
}

function readCache(): PopularCache | null {
  try {
    if (!fs.existsSync(CACHE_PATH)) return null;
    const raw = fs.readFileSync(CACHE_PATH, 'utf-8');
    return JSON.parse(raw) as PopularCache;
  } catch {
    return null;
  }
}

router.get('/', async (req, res) => {
  const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
  const limit = req.query.limit ? Math.min(50, Math.max(1, Number(req.query.limit))) : 12;
  const courseQ = typeof req.query.course === 'string' ? req.query.course.trim().toLowerCase() : '';
  const type = typeof req.query.type === 'string' ? req.query.type.trim() : '';

  let cache = readCache();
  if (isCacheStale(cache)) {
    try {
      cache = await buildPopularCache();
    } catch {
      // fallback: empty
      cache = { computedAt: new Date().toISOString(), items: [] };
    }
  }

  // Filter in-memory
  let list = cache!.items;
  if (courseQ) list = list.filter(i => (i.course || '').toLowerCase().includes(courseQ));
  if (type) list = list.filter(i => (i.type || '') === type);

  const total = list.length;
  const start = (page - 1) * limit;
  const items = list.slice(start, start + limit).map(i => {
    const baseUrl = process.env.PUBLIC_API_ORIGIN || `http://localhost:${process.env.PORT || 3000}`;
    return {
      id: i.id,
      title: i.title,
      description: i.description,
      course: i.course,
      type: i.type,
      fileUrl: `${baseUrl}/uploads/${i.filePath}`,
      fileName: i.filePath.split('/').pop(),
      fileType: i.fileMime,
      rating: i.avgRating || 0,
      downloads: i.downloadsCount,
      uploader: i.uploader ? `${i.uploader.firstName || ''} ${i.uploader.lastName || ''}`.trim() : 'Bilinmeyen',
      createdAt: i.createdAt,
    };
  });

  res.json({ items, page, limit, total, computedAt: cache!.computedAt });
});
