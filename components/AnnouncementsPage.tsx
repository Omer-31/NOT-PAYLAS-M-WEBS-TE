/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BellIcon, PinIcon, CalendarIcon } from './icons';

interface Announcement {
  id: number;
  title: string;
  content: string;
  author: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

const AnnouncementsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/announcements');
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data);
        } else {
          setError('Duyurular yüklenirken hata oluştu');
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setError('Duyurular yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Duyurular yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BellIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Duyurular</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Platform ile ilgili önemli duyuruları buradan takip edebilirsiniz.
        </p>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-12 text-center">
          <BellIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Henüz duyuru yok
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Yeni duyurular burada görünecek.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-6 ${
                announcement.isPinned ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {announcement.isPinned && (
                    <PinIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  )}
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {announcement.title}
                  </h2>
                </div>
              </div>
              
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {announcement.content}
                </p>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {new Date(announcement.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">{announcement.author}</span> tarafından
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
