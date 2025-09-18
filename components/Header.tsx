/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { LogoIcon, SearchIcon, BellIcon, LogoutIcon, SunIcon, MoonIcon, StarIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Page } from '../App';

interface HeaderProps {
  setActivePage: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ setActivePage }) => {
  const { currentUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-white/80 dark:bg-gray-800/50 dark:border-b dark:border-gray-700/50 backdrop-blur-sm shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Left side: Logo for mobile, hidden on larger screens */}
        <div className="flex items-center lg:hidden">
          <LogoIcon className="h-8 w-auto text-blue-600" />
          <span className="ml-2 text-lg font-bold text-gray-800 dark:text-white">ERÜ Not Paylaşım</span>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 flex justify-center px-4">
          <div className="relative w-full max-w-lg">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Ders notlarında ara..."
              className="w-full bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg py-2 pl-10 pr-4 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right side: Notifications and User Profile */}
        <div className="flex items-center gap-4">
           <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500">
            {theme === 'dark' ? <SunIcon className="h-6 w-6 text-yellow-400" /> : <MoonIcon className="h-6 w-6 text-gray-600" />}
          </button>
          <button 
            onClick={() => setActivePage('Duyurular')}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500"
          >
            <BellIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
          </button>
          
          {currentUser && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActivePage('Profilim')}
                className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
              >
                {currentUser.profilePictureUrl ? (
                  <img src={currentUser.profilePictureUrl} alt="Profil" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span className="bg-blue-100 text-blue-800 text-sm font-semibold h-9 w-9 flex items-center justify-center rounded-full dark:bg-blue-900 dark:text-blue-300">
                    {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
                  </span>
                )}
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{currentUser.firstName} {currentUser.lastName}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <StarIcon className="h-3 w-3 text-yellow-500" filled={true} />
                    {currentUser.points} puan
                  </span>
                </div>
              </button>
              <button onClick={logout} className="ml-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" aria-label="Çıkış Yap">
                <LogoutIcon className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;