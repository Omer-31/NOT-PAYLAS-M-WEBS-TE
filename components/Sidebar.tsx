/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
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
  BellIcon,
  ArrowLeftIcon,
  ArrowRightIcon
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
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, selectedNote, setSelectedNote, isCollapsed, setIsCollapsed }) => {
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
    <>
      {/* Sidebar Toggle Button - Fixed Position */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`fixed top-4 z-50 p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-300 ${
          isCollapsed ? 'left-4' : 'left-60'
        } lg:${isCollapsed ? 'left-4' : 'left-60'}`}
        title={isCollapsed ? 'Menüyü aç' : 'Menüyü kapat'}
      >
        {isCollapsed ? (
          <ArrowRightIcon className="h-5 w-5" />
        ) : (
          <ArrowLeftIcon className="h-5 w-5" />
        )}
      </button>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-xl z-40 transition-transform duration-300 ease-in-out w-64 ${
        isCollapsed ? '-translate-x-full' : 'translate-x-0'
      }`}>
        <div className="h-[65px] border-b border-gray-200 dark:border-gray-700 flex items-center justify-center px-6">
          <button 
            onClick={() => {
              if (selectedNote && setSelectedNote) {
                setSelectedNote(null);
              }
              setActivePage('HomePage');
            }} 
            className="flex items-center focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 rounded-lg p-2"
          >
            <LogoIcon className="h-8 w-auto text-blue-600" />
            <span className="ml-3 text-lg font-bold text-gray-800 dark:text-white">ERÜ Not Paylaşım</span>
          </button>
        </div>
        
        <nav className="flex-1 p-4 h-full overflow-y-auto">
          <ul className="space-y-2">
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
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-left ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
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

      {/* Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default Sidebar;