/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState } from 'react';
import { ChatAltIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';

type Thread = { id: number; title: string; body: string; author: string; faculty: string; department: string; classYear: string; replies: number; createdAt: string };

const ForumPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [scope, setScope] = useState<'cohort'|'global'>('cohort');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/forum/threads?scope=${scope}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setThreads(data);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [scope]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Forum</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">{currentUser?.department} • {currentUser?.classYear}</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setScope('cohort')} className={`px-4 py-2 rounded-lg ${scope==='cohort'?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>Bölüm + Sınıf</button>
        <button onClick={() => setScope('global')} className={`px-4 py-2 rounded-lg ${scope==='global'?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>Tüm Fakülteler</button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700/50">
          <ChatAltIcon className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Henüz konu yok.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map(t => (
            <div key={t.id} className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">{t.title}</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(t.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{t.body}</p>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t.author} • {t.department} • {t.classYear} • {t.replies} yanıt</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumPage;