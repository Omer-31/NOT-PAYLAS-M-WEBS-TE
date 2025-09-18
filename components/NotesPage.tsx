/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SearchIcon, StarIcon, DownloadIcon, FilterIcon, ChevronDownIcon } from './icons';
import { getNotes } from '../services/notes';
import { Note } from '../data/mockData';

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

type SortOption = 'popular' | 'newest' | 'highest_rated';

const NotesPage: React.FC<NotesPageProps> = ({ onNoteSelect }) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getNotes();
        setNotes(data);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const filteredAndSortedNotes = useMemo(() => {
    let filteredNotes = [...notes];

    // Filter by search term
    if (searchTerm) {
        const lowercasedFilter = searchTerm.toLowerCase();
        filteredNotes = filteredNotes.filter(note =>
            note.title.toLowerCase().includes(lowercasedFilter) ||
            note.course.toLowerCase().includes(lowercasedFilter) ||
            note.description.toLowerCase().includes(lowercasedFilter)
        );
    }
    
    // Sort
    switch(sortBy) {
        case 'newest':
            filteredNotes.sort((a, b) => b.id - a.id); // Assuming higher ID is newer
            break;
        case 'highest_rated':
            filteredNotes.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        case 'popular':
        default:
            filteredNotes.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
            break;
    }

    return filteredNotes;
  }, [notes, searchTerm, sortBy]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ders Notları</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          {currentUser?.department} bölümü için yüklenen notlar.
        </p>
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
             <div className="relative">
                <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none w-full md:w-auto bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg py-2.5 pl-4 pr-10 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="popular">En Popüler</option>
                    <option value="newest">En Yeni</option>
                    <option value="highest_rated">En Yüksek Puanlı</option>
                </select>
                <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <FilterIcon className="h-5 w-5"/>
                <span>Filtrele</span>
            </button>
        </div>
      </div>

      {/* Notes Grid */}
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
    </div>
  );
};

export default NotesPage;