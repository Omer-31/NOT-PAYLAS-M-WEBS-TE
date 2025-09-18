/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {
  BookOpenIcon,
  HeartIcon,
  TrendingUpIcon,
  ChatAltIcon,
  UploadIcon,
  UsersIcon,
  ChartBarIcon,
  LogoIcon,
  UserCircleIcon,
  BellIcon
} from './icons';
import { useAuth } from '../contexts/AuthContext';
import { Page } from '../App';

const navigationItems: { name: Page, icon: React.ElementType }[] = [
  { name: 'Ders Notları', icon: BookOpenIcon },
  { name: 'Favorilerim', icon: HeartIcon },
  { name: 'Popüler Notlar', icon: TrendingUpIcon },
  { name: 'Forum', icon: ChatAltIcon },
  { name: 'Not Yükle', icon: UploadIcon },
  { name: 'Sınıf Grupları', icon: UsersIcon },
  { name: 'Liderlik Tablosu', icon: ChartBarIcon },
  { name: 'Duyurular', icon: BellIcon },
];

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  selectedNote?: any;
  setSelectedNote?: (note: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, selectedNote, setSelectedNote }) => {
  const { currentUser } = useAuth();

  const colorMap: { [key: string]: string } = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500',
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-800/50 dark:border-r dark:border-gray-700/50 shadow-md hidden lg:flex flex-col">
      <button 
        onClick={() => {
          if (selectedNote && setSelectedNote) {
            setSelectedNote(null);
          }
          setActivePage('HomePage');
        }} 
        className="h-[65px] border-b border-gray-200 dark:border-gray-700 flex items-center justify-center px-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
      >
        <div className="flex items-center">
            <LogoIcon className="h-8 w-auto text-blue-600" />
            <span className="ml-3 text-lg font-bold text-gray-800 dark:text-white">ERÜ Not Paylaşım</span>
        </div>
      </button>
      

      <nav className="flex-1 p-4">
        <ul>
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.name;
            return (
              <li key={item.name}>
                <button
                  onClick={() => {
                    if (setSelectedNote) {
                      setSelectedNote(null);
                    }
                    setActivePage(item.name);
                  }}
                  className={`w-full flex items-center px-4 py-2.5 my-1 text-sm font-medium rounded-lg transition-colors duration-200 text-left ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;