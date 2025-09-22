/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SearchIcon, StarIcon, DownloadIcon, FilterIcon, ChevronDownIcon } from './icons';
import { getNotes, NotesQuery } from '../services/notes';
import { Note } from '../data/mockData';
import { useSearch } from '../contexts/SearchContext';
import { getCoursesFor } from '../data/curriculum';
 

const NoteCard: React.FC<{ note: Note; onNoteSelect: (note: Note) => void; }> = ({ note, onNoteSelect }) => (
    <button onClick={() => onNoteSelect(note)} className="bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700 flex flex-col justify-between text-left w-full">
        <div>
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">{note.course}</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-3 mb-2">{note.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Yükleyen: {note.uploader || 'Bilinmeyen'}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
                <StarIcon className="h-5 w-5 text-yellow-500 mr-1" />
                <span className="font-bold">{note.rating || 0}</span>
            </div>
            <div className="flex items-center">
                <DownloadIcon className="h-5 w-5 mr-1" />
                <span>{note.downloads || 0}</span>
            </div>
        </div>
    </button>
);

interface NotesPageProps {
  onNoteSelect: (note: Note) => void;
}

type SortOption = 'popular' | 'newest' | 'oldest';

const NotesPage: React.FC<NotesPageProps> = ({ onNoteSelect }) => {
  const { currentUser } = useAuth();
  const { query: searchTerm, setQuery: setSearchTerm } = useSearch();
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [allTotal, setAllTotal] = useState(0);
  const [filterCourse, setFilterCourse] = useState('');
  const [filterType, setFilterType] = useState('');
  const [courseCounts, setCourseCounts] = useState<Record<string, number>>({});
  const [countsLoading, setCountsLoading] = useState(false);
  const [showAllChips, setShowAllChips] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const params: NotesQuery = {
          q: searchTerm || undefined,
          sort: sortBy,
          page,
          limit,
          course: filterCourse || undefined,
          type: filterType || undefined,
        };
        
        try {
          const data = await getNotes(params);
          setNotes(Array.isArray(data.items) ? data.items : data);
          setTotal(data.total ?? (Array.isArray(data.items) ? data.items.length : data.length));

          // Also fetch global total irrespective of course filter
          const allParams: NotesQuery = {
            q: searchTerm || undefined,
            sort: sortBy,
            page: 1,
            limit: 1,
            type: filterType || undefined,
          };
          try {
            const allData = await getNotes(allParams);
            setAllTotal(allData.total ?? (Array.isArray(allData.items) ? allData.items.length : 0));
          } catch {}
        } catch (apiError) {
          console.warn('API failed, using mock data:', apiError);
          // Fallback to mock data if API fails
          const { mockNotes } = await import('../data/mockData');
          let filteredNotes = [...mockNotes];
          
          // Apply filters
          if (searchTerm) {
            filteredNotes = filteredNotes.filter(note => 
              note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              note.course.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          
          if (filterCourse) {
            filteredNotes = filteredNotes.filter(note => 
              note.course.toLowerCase() === filterCourse.toLowerCase()
            );
          }
          
          if (filterType) {
            filteredNotes = filteredNotes.filter(note => 
              note.type?.toLowerCase() === filterType.toLowerCase()
            );
          }
          
          // Apply sorting
          if (sortBy === 'newest') {
            filteredNotes.sort((a, b) => b.id - a.id);
          } else if (sortBy === 'oldest') {
            filteredNotes.sort((a, b) => a.id - b.id);
          } else {
            filteredNotes.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          }
          
          // Apply pagination
          const startIndex = (page - 1) * limit;
          const paginatedNotes = filteredNotes.slice(startIndex, startIndex + limit);
          
          setNotes(paginatedNotes);
          setTotal(filteredNotes.length);
          setAllTotal(mockNotes.length);
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [searchTerm, sortBy, page, limit, filterCourse, filterType]);

  // Fetch per-course counts (respecting current searchTerm and filterType)
  useEffect(() => {
    const fetchCounts = async () => {
      if (!currentUser) return;
      const courses = getCoursesFor(currentUser.faculty, currentUser.department, currentUser.classYear) || [];
      if (courses.length === 0) return;
      try {
        setCountsLoading(true);
        const entries = await Promise.all(courses.map(async (c) => {
          try {
            const resp = await getNotes({ q: searchTerm || undefined, type: filterType || undefined, course: c, page: 1, limit: 1 });
            const t = resp?.total ?? (Array.isArray(resp.items) ? resp.items.length : 0);
            return [c, t] as const;
          } catch (apiError) {
            // Fallback to mock data count
            const { mockNotes } = await import('../data/mockData');
            let filteredNotes = mockNotes.filter(note => note.course.toLowerCase() === c.toLowerCase());
            
            if (searchTerm) {
              filteredNotes = filteredNotes.filter(note => 
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.course.toLowerCase().includes(searchTerm.toLowerCase())
              );
            }
            
            if (filterType) {
              filteredNotes = filteredNotes.filter(note => 
                note.type?.toLowerCase() === filterType.toLowerCase()
              );
            }
            
            return [c, filteredNotes.length] as const;
          }
        }));
        const map: Record<string, number> = {};
        for (const [c, t] of entries) map[c] = t;
        setCourseCounts(map);
      } catch (e) {
        // ignore counts errors
      } finally { setCountsLoading(false); }
    };
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, searchTerm, filterType]);

  const filteredAndSortedNotes = useMemo(() => {
    // Server tarafı zaten q/course/type/sort uyguluyor; burada sadece gelen listeyi döndürüyoruz
    return [...notes];
  }, [notes]);

  const myCurriculumCourses = useMemo(() => {
    if (!currentUser) return null;
    return getCoursesFor(currentUser.faculty, currentUser.department, currentUser.classYear);
  }, [currentUser]);

  // Display courses order: by count desc, then alphabetically; limit when collapsed
  const displayCourses = useMemo(() => {
    const list = myCurriculumCourses ? [...myCurriculumCourses] : [];
    list.sort((a, b) => {
      const ca = courseCounts[a] ?? -1;
      const cb = courseCounts[b] ?? -1;
      if (cb !== ca) return cb - ca;
      return a.localeCompare(b, 'tr');
    });
    if (!showAllChips) return list.slice(0, 8);
    return list;
  }, [myCurriculumCourses, courseCounts, showAllChips]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ders Notları</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          {currentUser?.department} bölümü için yüklenen notlar.
        </p>
        {myCurriculumCourses && myCurriculumCourses.length > 0 && (
          <div className="mt-1 bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-200/70 dark:border-gray-700/60 rounded-xl p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Dersler:</span>
              <button
                aria-pressed={filterCourse===''}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors border focus:outline-none focus:ring-2 focus:ring-blue-400 ${filterCourse==='' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-transparent text-gray-700 dark:text-gray-200 border-gray-300/70 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => { setFilterCourse(''); setPage(1); }}
              >
                Tümü ({countsLoading ? '…' : allTotal})
              </button>
              {displayCourses.map((course, idx) => {
                const palette = [
                  'border-rose-300 text-rose-700 hover:bg-rose-50 dark:text-rose-200 dark:border-rose-400/60 dark:hover:bg-rose-900/30',
                  'border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-200 dark:border-emerald-400/60 dark:hover:bg-emerald-900/30',
                  'border-amber-300 text-amber-700 hover:bg-amber-50 dark:text-amber-200 dark:border-amber-400/60 dark:hover:bg-amber-900/30',
                  'border-sky-300 text-sky-700 hover:bg-sky-50 dark:text-sky-200 dark:border-sky-400/60 dark:hover:bg-sky-900/30',
                  'border-violet-300 text-violet-700 hover:bg-violet-50 dark:text-violet-200 dark:border-violet-400/60 dark:hover:bg-violet-900/30',
                ];
                const variant = palette[idx % palette.length];
                const isActive = filterCourse.toLowerCase()===course.toLowerCase();
                const base = 'px-3 py-1.5 rounded-full text-sm transition-colors border focus:outline-none focus:ring-2';
                const cls = isActive
                  ? `${base} bg-blue-600 text-white border-blue-600 focus:ring-blue-400 shadow-sm`
                  : `${base} bg-transparent ${variant} focus:ring-current`;
                const countForChip = isActive ? total : (countsLoading ? '…' : (courseCounts[course] ?? 0));
                return (
                  <button
                    key={course}
                    aria-pressed={isActive}
                    className={cls}
                    onClick={() => { setFilterCourse(course); setPage(1); }}
                  >
                    {course} ({countForChip})
                  </button>
                );
              })}
              {myCurriculumCourses.length > 8 && (
                <button
                  className="ml-1 px-3 py-1.5 rounded-full text-sm border bg-transparent text-gray-700 dark:text-gray-200 border-gray-300/70 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onClick={() => setShowAllChips(v => !v)}
                >
                  {showAllChips ? 'Daha az' : 'Daha fazla'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search and Filter Toolbar */}
      <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-grow w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Not başlığı, ders kodu veya konu ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg py-2.5 pl-10 pr-4 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
            <select 
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg py-2.5 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tümü</option>
              <option value="pdf">PDF</option>
              <option value="image">Görsel</option>
              <option value="doc">DOC/DOCX</option>
              <option value="other">Diğer</option>
            </select>
            <div className="relative">
               <select 
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as SortOption); setPage(1); }}
                  className="appearance-none w-full md:w-auto bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg py-2.5 pl-4 pr-10 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
               >
                   <option value="popular">En Popüler</option>
                   <option value="newest">En Yeni</option>
                   <option value="oldest">En Eski</option>
               </select>
               <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
             </div>
             <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
               <FilterIcon className="h-5 w-5"/>
               <span>Filtrele</span>
             </button>
        </div>
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Notlar yükleniyor...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedNotes.map(note => (
              <NoteCard key={note.id} note={note} onNoteSelect={onNoteSelect} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && (
        <div className="flex items-center justify-center gap-4">
          <button disabled={page<=1} onClick={() => setPage(prev => Math.max(1, prev-1))} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-50">Önceki</button>
          <span className="text-sm text-gray-600 dark:text-gray-300">Sayfa {page} / {Math.max(1, Math.ceil(total / limit))}</span>
          <button disabled={page>=Math.ceil(total/limit)} onClick={() => setPage(prev => prev+1)} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-50">Sonraki</button>
        </div>
      )}
    </div>
  );
};

export default NotesPage;