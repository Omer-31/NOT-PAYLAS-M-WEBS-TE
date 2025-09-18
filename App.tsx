/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import NotesPage from './components/NotesPage';
import UploadNotePage from './components/UploadNotePage';
import NoteDetailPage from './components/NoteDetailPage';
import { Note } from './data/mockData';
import FavoritesPage from './components/FavoritesPage';
import PopularNotesPage from './components/PopularNotesPage';
import ForumPage from './components/ForumPage';
import ClassGroupsPage from './components/ClassGroupsPage';
import LeaderboardPage from './components/LeaderboardPage';
import ProfilePage from './components/ProfilePage';
import AnnouncementsPage from './components/AnnouncementsPage';

export type Page = "HomePage" | "Ders Notları" | "Favorilerim" | "Popüler Notlar" | "Forum" | "Not Yükle" | "Sınıf Grupları" | "Liderlik Tablosu" | "Profilim" | "Duyurular";

const App: React.FC = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const [activePage, setActivePage] = useState<Page>("HomePage");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Load user from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setCurrentUser({ ...userData, token });
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [setCurrentUser]);

  if (!currentUser) {
    return <AuthPage />;
  }

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
  }

  const handleBackToNotes = () => {
    setSelectedNote(null);
  }

  const renderContent = () => {
    if (selectedNote) {
      return <NoteDetailPage note={selectedNote} onBack={handleBackToNotes} />;
    }

    switch (activePage) {
      case "Ders Notları":
        return <NotesPage onNoteSelect={handleNoteSelect} />;
      case "Not Yükle":
        return <UploadNotePage setActivePage={setActivePage} />;
      case "Favorilerim":
        return <FavoritesPage onNoteSelect={handleNoteSelect} />;
      case "Popüler Notlar":
        return <PopularNotesPage />;
      case "Forum":
        return <ForumPage />;
      case "Sınıf Grupları":
        return <ClassGroupsPage />;
      case "Liderlik Tablosu":
        return <LeaderboardPage />;
      case "Profilim":
        return <ProfilePage />;
      case "Duyurular":
        return <AnnouncementsPage />;
      case "HomePage":
      default:
        return <HomePage setActivePage={setActivePage} />;
    }
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <div className="flex min-h-screen">
        <Sidebar activePage={activePage} setActivePage={setActivePage} selectedNote={selectedNote} setSelectedNote={setSelectedNote} />
        <div className="flex-1 flex flex-col">
          <Header setActivePage={setActivePage} />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;