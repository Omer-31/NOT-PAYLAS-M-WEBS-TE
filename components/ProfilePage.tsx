/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StarIcon, BookOpenIcon, UploadIcon } from './icons';
import { mockNotes } from '../data/mockData';
import { Note } from '../data/mockData';

const ProfilePage: React.FC = () => {
  const { currentUser, updateProfilePicture, fetchUserProfile, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    faculty: '',
    department: '',
    classYear: ''
  });
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Load user profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Load user's notes
  useEffect(() => {
    const fetchUserNotes = async () => {
      if (!currentUser) return;
      
      setLoadingNotes(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/notes?userId=${currentUser.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const notes = await response.json();
          setUserNotes(notes);
        }
      } catch (error) {
        console.error('Error fetching user notes:', error);
      } finally {
        setLoadingNotes(false);
      }
    };

    fetchUserNotes();
  }, [currentUser]);

  // Initialize edit form when user data changes
  useEffect(() => {
    if (currentUser) {
      setEditForm({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        faculty: currentUser.faculty || '',
        department: currentUser.department || '',
        classYear: currentUser.classYear || ''
      });
    }
  }, [currentUser]);

  if (!currentUser) {
    return <div>Yükleniyor...</div>;
  }

  const handlePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For now, convert to base64 and update locally
      // In a real app, you'd upload to a file storage service
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          await updateProfile({ profilePictureUrl: base64 });
        } catch (error) {
          console.error('Error updating profile picture:', error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      faculty: currentUser.faculty || '',
      department: currentUser.department || '',
      classYear: currentUser.classYear || ''
    });
    setIsEditing(false);
  };


  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800/50 p-8 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          <img
            src={currentUser.profilePictureUrl || `https://ui-avatars.com/api/?name=${currentUser.firstName}+${currentUser.lastName}`}
            alt="Profil Fotoğrafı"
            className="h-32 w-32 rounded-full object-cover border-4 border-blue-500"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            aria-label="Profil fotoğrafını değiştir"
          >
            <UploadIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePictureChange}
            className="hidden"
            accept="image/png, image/jpeg"
          />
        </div>
        <div className="text-center md:text-left flex-1">
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ad</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Soyad</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fakülte</label>
                  <input
                    type="text"
                    value={editForm.faculty}
                    onChange={(e) => setEditForm({...editForm, faculty: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bölüm</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sınıf</label>
                  <input
                    type="text"
                    value={editForm.classYear}
                    onChange={(e) => setEditForm({...editForm, classYear: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  İptal
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentUser.firstName} {currentUser.lastName}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{currentUser.department}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.classYear}</p>
              <div className="mt-4 flex items-center justify-center md:justify-start gap-2 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-300 font-semibold px-3 py-1.5 rounded-full">
                <StarIcon className="h-5 w-5" filled={true} />
                <span>{currentUser.points?.toLocaleString() || 0} Puan</span>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Profili Düzenle
              </button>
            </>
          )}
        </div>
      </div>

      {/* User's Notes */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpenIcon className="h-6 w-6"/>
            Yüklediğim Notlar
        </h2>
        {loadingNotes ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Notlar yükleniyor...</span>
          </div>
        ) : userNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userNotes.map(note => (
              <div key={note.id} className="bg-white dark:bg-gray-800/50 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                <span className="text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">{note.course}</span>
                <h3 className="text-md font-bold text-gray-900 dark:text-white mt-3 mb-1">{note.title}</h3>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-semibold">{note.type}</span>
                    <div className="flex items-center gap-1">
                        <StarIcon className="h-4 w-4 text-yellow-500" />
                        <span>{note.rating}</span>
                    </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-white dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700/50">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Henüz hiç not yüklemedin.</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Bilgini paylaşarak platforma katkıda bulunabilirsin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
