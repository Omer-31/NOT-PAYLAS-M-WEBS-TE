/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { HeartIcon, StarIcon, DownloadIcon, PlusIcon, FolderIcon, PencilIcon, TrashIcon, XMarkIcon } from './icons';
import { Note, FavoriteCategory } from '../types';

interface FavoritesPageProps {
  onNoteSelect?: (note: Note) => void;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ onNoteSelect }) => {
  const [favorites, setFavorites] = useState<Note[]>([]);
  const [categories, setCategories] = useState<FavoriteCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<FavoriteCategory | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [noteToMove, setNoteToMove] = useState<Note | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
        console.log('No token found');
          setLoading(false);
          return;
        }

      console.log('Fetching favorites data...');

      const [favoritesResponse, categoriesResponse] = await Promise.all([
        fetch('http://localhost:3000/api/favorites', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/favorites/categories', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      console.log('Favorites response status:', favoritesResponse.status);
      console.log('Categories response status:', categoriesResponse.status);

      if (favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json();
        console.log('Favorites data:', favoritesData);
        setFavorites(favoritesData);
      } else {
        const errorText = await favoritesResponse.text();
        console.error('Favorites error:', errorText);
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        console.log('Categories data:', categoriesData);
        setCategories(categoriesData);
      } else {
        const errorText = await categoriesResponse.text();
        console.error('Categories error:', errorText);
        }
      } catch (error) {
      console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

  const createCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      console.log('Creating category:', newCategoryName.trim());
      
      const response = await fetch('http://localhost:3000/api/favorites/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });

      console.log('Create category response status:', response.status);

      if (response.ok) {
        const newCategory = await response.json();
        console.log('Category created successfully:', newCategory);
        setCategories([...categories, { ...newCategory, _count: { favorites: 0 } }]);
        setNewCategoryName('');
        setShowCreateCategory(false);
      } else {
        const errorText = await response.text();
        console.error('Create category error:', errorText);
        alert('Kategori oluşturulurken hata oluştu: ' + errorText);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Kategori oluşturulurken hata oluştu: ' + error);
    }
  };

  const updateCategory = async (categoryId: number, name: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/favorites/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });

      if (response.ok) {
        setCategories(categories.map(cat => 
          cat.id === categoryId ? { ...cat, name } : cat
        ));
        setEditingCategory(null);
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const deleteCategory = async (categoryId: number) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz? Kategorideki notlar kategorisiz olarak kalacak.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/favorites/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== categoryId));
        setFavorites(favorites.map(note => 
          note.category?.id === categoryId ? { ...note, category: null } : note
        ));
        if (selectedCategory === categoryId) {
          setSelectedCategory(null);
        }
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const moveNoteToCategory = async (noteId: number, categoryId: number | null) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/favorites/${noteId}/category`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ categoryId })
      });

      if (response.ok) {
        const category = categoryId ? categories.find(cat => cat.id === categoryId) : null;
        setFavorites(favorites.map(note => 
          note.id === noteId ? { ...note, category: category ? { id: category.id, name: category.name } : null } : note
        ));
        setShowMoveModal(false);
        setNoteToMove(null);
      }
    } catch (error) {
      console.error('Error moving note:', error);
    }
  };

  const openNote = (note: Note) => {
    if (onNoteSelect) {
      onNoteSelect(note);
      return;
    }
    window.open(note.fileUrl, '_blank');
  };

  const filteredFavorites = selectedCategory === null 
    ? favorites.filter(note => !note.category)
    : favorites.filter(note => note.category?.id === selectedCategory);

  const NoteCard: React.FC<{ note: Note }> = ({ note }) => (
    <div 
      className="bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 cursor-pointer group"
      onClick={() => openNote(note)}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">{note.course}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setNoteToMove(note);
              setShowMoveModal(true);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Kategori değiştir"
          >
            <FolderIcon className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-3 mb-2">{note.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Yükleyen: {note.uploader || 'Bilinmeyen'}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{note.description}</p>
        {note.category && (
          <div className="mt-2">
            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full">
              {note.category.name}
            </span>
          </div>
        )}
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
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Favorilerim</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Beğendiğiniz ve daha sonra tekrar göz atmak için kaydettiğiniz notlar.
        </p>
      </div>
        <button
          onClick={() => setShowCreateCategory(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Kategori Oluştur
        </button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Kategorisiz ({favorites.filter(note => !note.category).length})
        </button>
        {categories.map(category => (
          <div key={category.id} className="flex items-center gap-1">
            <button
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category.name} ({category._count?.favorites || 0})
            </button>
            <button
              onClick={() => setEditingCategory(category)}
              className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
              title="Düzenle"
            >
              <PencilIcon className="h-4 w-4 text-gray-500" />
            </button>
            <button
              onClick={() => deleteCategory(category.id)}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
              title="Sil"
            >
              <TrashIcon className="h-4 w-4 text-red-500" />
            </button>
          </div>
        ))}
      </div>

      {/* Create Category Modal */}
      {showCreateCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Yeni Kategori</h3>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Kategori adı"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && createCategory()}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={createCategory}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Oluştur
              </button>
              <button
                onClick={() => {
                  setShowCreateCategory(false);
                  setNewCategoryName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Kategori Düzenle</h3>
            <input
              type="text"
              defaultValue={editingCategory.name}
              ref={(input) => input?.focus()}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  updateCategory(editingCategory.id, (e.target as HTMLInputElement).value);
                }
              }}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={(e) => {
                  const input = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement;
                  updateCategory(editingCategory.id, input.value);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Kaydet
              </button>
              <button
                onClick={() => setEditingCategory(null)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Note Modal */}
      {showMoveModal && noteToMove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              "{noteToMove.title}" notunu taşı
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => moveNoteToCategory(noteToMove.id, null)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Kategorisiz
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => moveNoteToCategory(noteToMove.id, category.id)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  {category.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowMoveModal(false);
                setNoteToMove(null);
              }}
              className="w-full mt-4 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Favoriler yükleniyor...</p>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700/50">
          <HeartIcon className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            {selectedCategory === null ? 'Kategorisiz not yok.' : 'Bu kategoride not yok.'}
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {selectedCategory === null 
              ? 'Beğendiğiniz notlardaki kalp ikonuna tıklayarak onları buraya ekleyebilirsiniz.'
              : 'Bu kategoriye not eklemek için not kartındaki klasör ikonuna tıklayın.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFavorites.map(note => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
