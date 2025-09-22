/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUpIcon, StarIcon, DownloadIcon } from './icons';
import { getPopularNotes } from '../services/popular';
import { Note } from '../data/mockData';
import { API_URL } from '../config';

type PopularItem = {
  id: number;
  title: string;
  description: string;
  course: string;
  type?: string;
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  rating?: number;
  downloads?: number;
  uploader?: string;
  createdAt?: string;
};

const medalClass = (rank: number) => {
  if (rank === 1) return 'bg-yellow-500 text-white';
  if (rank === 2) return 'bg-gray-400 text-white';
  if (rank === 3) return 'bg-amber-700 text-white';
  return 'bg-blue-600 text-white';
};

const SkeletonCard: React.FC = () => (
  <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
    <div className="mt-3 h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
    <div className="mt-2 h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-4 w-14 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
);

interface PopularNotesPageProps {
  onNoteSelect?: (note: Note) => void;
}

const PopularNotesPage: React.FC<PopularNotesPageProps> = ({ onNoteSelect }) => {
  const [items, setItems] = useState<PopularItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [computedAt, setComputedAt] = useState<string | null>(null);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);
  const computedAtText = useMemo(() => {
    if (!computedAt) return null;
    try {
      const d = new Date(computedAt);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleString('tr-TR');
    } catch { return null; }
  }, [computedAt]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPopularNotes({ page, limit });
        setItems(data.items || []);
        setTotal(data.total || 0);
        setComputedAt(data.computedAt || null);
      } catch (e: any) {
        setError(e?.message || 'Popüler notlar yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [page, limit]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUpIcon className="h-7 w-7 text-blue-600" /> Popüler Notlar
        </h1>
        <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <p className="text-gray-500 dark:text-gray-400">Bugünün en popüler notları. Sıralama günlük olarak yenilenir.</p>
          {computedAtText && (
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Son güncelleme: {computedAtText}</span>
          )}
        </div>
      </div>

      {/* Filters removed as requested */}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <button onClick={() => { setPage(1); }} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg">Tekrar dene</button>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700/50">
          <TrendingUpIcon className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Henüz popüler not yok.</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Filtreleri değiştirerek tekrar deneyebilirsin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((note, idx) => {
            const rank = (page - 1) * limit + (idx + 1);
            const handleOpen = () => {
              if (onNoteSelect) {
                // Map PopularItem -> Note shape
                const ext = (note.fileName || '').split('.').pop()?.toLowerCase();
                const inferFileType = (): 'pdf' | 'png' | 'jpg' | 'docx' => {
                  if (ext === 'pdf') return 'pdf';
                  if (ext === 'png') return 'png';
                  if (ext === 'jpg' || ext === 'jpeg') return 'jpg';
                  if (ext === 'doc' || ext === 'docx') return 'docx';
                  return 'pdf';
                };
                const mapped: Note = {
                  id: note.id,
                  title: note.title,
                  course: note.course || '',
                  uploader: note.uploader || 'Bilinmeyen',
                  rating: Number(note.rating || 0),
                  downloads: Number(note.downloads || 0),
                  // In this app, `type` is used like file/type tag in filters; map backend type as-is
                  type: (note.type as any) || 'Ders Notu',
                  fileName: note.fileName || 'dosya',
                  fileUrl: note.fileUrl,
                  fileType: inferFileType(),
                  description: note.description || '',
                  comments: [],
                };
                onNoteSelect(mapped);
              } else {
                window.open(note.fileUrl, '_blank');
              }
            };
            return (
              <button
                key={note.id}
                type="button"
                onClick={handleOpen}
                className="text-left relative bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                aria-label={`Notu aç: ${note.title}`}
              >
                {/* Medal */}
                <div className={`absolute -top-3 -left-3 px-2 py-1 rounded-full text-xs font-bold ${medalClass(rank)}`}>#{rank}</div>
                <span className="text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">{note.course}</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-3 mb-1 line-clamp-2">{note.title}</h3>
                {note.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{note.description}</p>
                )}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1"><StarIcon className="h-4 w-4 text-yellow-500" />{note.rating || 0}</span>
                    <span className="inline-flex items-center gap-1"><DownloadIcon className="h-4 w-4" />{note.downloads || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {note.type && (
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">{note.type.toUpperCase()}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-center gap-4">
          <button disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-50">Önceki</button>
          <span className="text-sm text-gray-600 dark:text-gray-300">Sayfa {page} / {totalPages}</span>
          <button disabled={page>=totalPages} onClick={() => setPage(p => p+1)} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-50">Sonraki</button>
        </div>
      )}
    </div>
  );
};

export default PopularNotesPage;
