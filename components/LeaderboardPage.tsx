/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { ChartBarIcon, MedalIcon, StarIcon } from './icons';

interface LeaderboardUser {
  id: number;
  name: string;
  points: number;
  notesCount: number;
  totalDownloads: number;
  avgRating: number;
}

const LeaderboardRow: React.FC<{ user: LeaderboardUser; rank: number }> = ({ user, rank }) => {
    const rankColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-500';
        if (rank === 2) return 'text-gray-400';
        if (rank === 3) return 'text-orange-500';
        return 'text-gray-500 dark:text-gray-400';
    };

    return (
        <div className="flex items-center p-4 bg-white dark:bg-gray-800/50 rounded-lg transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
            <div className={`w-10 text-lg font-bold ${rankColor(rank)} flex items-center justify-center`}>
                {rank <= 3 ? <MedalIcon className="h-6 w-6" /> : rank}
            </div>
            <div className="flex items-center flex-grow gap-4 ml-4">
                <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</span>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.notesCount} not • {user.totalDownloads} indirme
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
                <StarIcon className="h-5 w-5 text-yellow-500" />
                <span>{user.points.toLocaleString()}</span>
            </div>
        </div>
    )
}

const LeaderboardPage: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/leaderboard');
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        const data = await response.json();
        setLeaderboardData(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><ChartBarIcon className="h-8 w-8"/> Liderlik Tablosu</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Platforma en çok katkıda bulunan öğrencileri görün. Not yükle, puan topla, sıralamada yüksel!
        </p>
      </div>
      
      <div className="bg-white/50 dark:bg-gray-800/20 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center px-4 py-2 mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
            <div className="w-10 text-left">#</div>
            <div className="flex-grow ml-4">Öğrenci</div>
            <div className="">Puan</div>
        </div>
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Liderlik tablosu yükleniyor...</p>
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400">Henüz hiç kullanıcı yok.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboardData.map((user, index) => (
              <LeaderboardRow key={user.id} user={user} rank={index + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;