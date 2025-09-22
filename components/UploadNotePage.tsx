/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState } from 'react';
import { UploadIcon } from './icons';
import { Page } from '../App';
import { createNoteFormData } from '../services/notes';
import { useAuth } from '../contexts/AuthContext';
import { fetchCoursesFor } from '../services/curriculum';

interface UploadNotePageProps {
    setActivePage: (page: Page) => void;
}

const UploadNotePage: React.FC<UploadNotePageProps> = ({ setActivePage }) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [course, setCourse] = useState('');
    const [courseOptions, setCourseOptions] = useState<string[]>([]);
    const { currentUser } = useAuth();

    const commonInputClass = "w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500";
    const commonButtonClass = "w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50";
    
    // Load curriculum-based course options for the logged-in user
    useEffect(() => {
        const loadCourses = async () => {
            if (!currentUser) return;
            const courses = await fetchCoursesFor({
                faculty: currentUser.faculty || '',
                department: currentUser.department || '',
                classYear: currentUser.classYear || ''
            });
            const list = Array.isArray(courses) ? courses : [];
            // Append "Diğer" option at the end
            setCourseOptions([...list, 'Diğer']);
            // Preselect none by default; user can pick relevant ones
        };
        loadCourses();
    }, [currentUser]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        } else {
            setFileName(null);
        }
    }

    // tags feature removed per request

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        
        if (!fileInput.files || !fileInput.files[0]) {
            alert("Lütfen bir dosya seçin.");
            return;
        }
        
        if (!course.trim()) {
            alert("Lütfen ders adını girin.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
                return;
            }
            await createNoteFormData({
                file: fileInput.files[0],
                title,
                description,
                course: course.trim()
            }, token);

            alert("Not başarıyla yüklendi!");
            setActivePage("Ders Notları");
        } catch (error: any) {
            alert(error.message || "Not yüklenirken hata oluştu");
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Yeni Not Yükle</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Bilgini paylaşarak diğer öğrencilere yardımcı ol ve puan kazan!
                </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800/50 p-8 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="course-name">Ders Adı</label>
                        {courseOptions.length === 0 ? (
                          <input id="course-name" type="text" placeholder="Ders adı" value={course} onChange={(e) => setCourse(e.target.value)} className={commonInputClass} required />
                        ) : (
                          <select id="course-name" value={course} onChange={(e) => setCourse(e.target.value)} className={commonInputClass} required>
                            <option value="" disabled>Ders seçin</option>
                            {courseOptions.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        )}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="note-title">Not Başlığı</label>
                        <input id="note-title" type="text" placeholder="Örn: Vize Konuları Özet Notları" value={title} onChange={e => setTitle(e.target.value)} className={commonInputClass} required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="note-description">Açıklama</label>
                        <textarea id="note-description" placeholder="Not hakkında kısa bir açıklama ekle..." value={description} onChange={e => setDescription(e.target.value)} className={`${commonInputClass} min-h-[100px]`} rows={4}></textarea>
                    </div>

                    {/* Tags removed as requested */}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dosya Yükle</label>
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                            <UploadIcon className="h-10 w-10 text-gray-400 mb-2" />
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">Dosya seçmek için tıkla</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">veya sürükleyip bırak</span>
                            {fileName && <p className="text-sm text-green-600 dark:text-green-400 mt-4 font-medium">Seçilen dosya: {fileName}</p>}
                        </label>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} required />
                    </div>
                    
                    <div className="pt-4">
                         <button type="submit" className={commonButtonClass}>Notu Yükle</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadNotePage;