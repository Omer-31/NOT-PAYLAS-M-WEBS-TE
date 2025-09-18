/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { TrendingUpIcon } from './icons';

const PopularNotesPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Popüler Notlar</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Platformdaki en çok indirilen ve en yüksek puan alan notlar.
        </p>
      </div>
       <div className="text-center py-20 px-4 bg-white dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700/50">
        <TrendingUpIcon className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Popüler notlar yakında burada olacak.</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Bu özellik üzerinde çalışıyoruz. En beğenilen notları yakında burada bulabileceksiniz.</p>
      </div>
    </div>
  );
};

export default PopularNotesPage;
