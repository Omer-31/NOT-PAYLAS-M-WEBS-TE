/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { UploadIcon, MagicWandIcon, TagIcon } from './icons';
import { generateTags } from '../services/geminiService';
import Spinner from './Spinner';
import { Page } from '../App';

interface UploadNotePageProps {
    setActivePage: (page: Page) => void;
}

const UploadNotePage: React.FC<UploadNotePageProps> = ({ setActivePage }) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
    const [isLoadingTags, setIsLoadingTags] = useState(false);
    const [tagError, setTagError] = useState<string | null>(null);

    const commonInputClass = "w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500";
    const commonButtonClass = "w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50";
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        } else {
            setFileName(null);
        }
    }

    const handleGenerateTags = async () => {
        if (!title || !description) {
            setTagError("Lütfen önce not başlığı ve açıklama girin.");
            return;
        }
        setIsLoadingTags(true);
        setTagError(null);
        setSuggestedTags([]);
        try {
            const result = await generateTags(title, description);
            setSuggestedTags(result.filter(tag => !tags.includes(tag)));
        } catch (error) {
            setTagError("Etiketler oluşturulurken bir hata oluştu.");
        } finally {
            setIsLoadingTags(false);
        }
    };

    const addTag = (tag: string) => {
        if (!tags.includes(tag)) {
            setTags([...tags, tag]);
            setSuggestedTags(suggestedTags.filter(t => t !== tag));
        }
    };
    
    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        const courseInput = document.getElementById('course-name') as HTMLInputElement;
        
        if (!fileInput.files || !fileInput.files[0]) {
            alert("Lütfen bir dosya seçin.");
            return;
        }
        
        if (!courseInput.value.trim()) {
            alert("Lütfen ders adını girin.");
            return;
        }
        
        formData.append('file', fileInput.files[0]);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('course', courseInput.value.trim());
        
        // Tags'ı ayrı ayrı ekle
        tags.forEach((tag, index) => {
            formData.append(`tags[${index}]`, tag);
        });
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
                return;
            }
            
            const response = await fetch('http://localhost:3000/api/notes', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Backend error:', errorData);
                throw new Error(errorData.message || 'Not yüklenirken hata oluştu');
            }
            
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
                        <input id="course-name" type="text" placeholder="Örn: Veri Yapıları" className={commonInputClass} required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="note-title">Not Başlığı</label>
                        <input id="note-title" type="text" placeholder="Örn: Vize Konuları Özet Notları" value={title} onChange={e => setTitle(e.target.value)} className={commonInputClass} required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="note-description">Açıklama</label>
                        <textarea id="note-description" placeholder="Not hakkında kısa bir açıklama ekle..." value={description} onChange={e => setDescription(e.target.value)} className={`${commonInputClass} min-h-[100px]`} rows={4}></textarea>
                    </div>

                    {/* AI Tag Generation */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                         <div className="flex items-center gap-2 mb-2">
                            <MagicWandIcon className="h-5 w-5 text-purple-500" />
                            <h3 className="font-semibold text-md text-gray-800 dark:text-gray-200">AI Etiket Önerisi</h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Notunuzun daha kolay bulunması için AI'dan etiket önerileri alın.</p>
                        <button type="button" onClick={handleGenerateTags} disabled={isLoadingTags} className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60">
                           {isLoadingTags ? <Spinner /> : <><MagicWandIcon className="h-4 w-4" /> Öneri Oluştur</>}
                        </button>
                        {tagError && <p className="text-red-500 text-sm mt-2">{tagError}</p>}
                        {suggestedTags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {suggestedTags.map(tag => (
                                    <button type="button" key={tag} onClick={() => addTag(tag)} className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-purple-900 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800">
                                        + {tag}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tags Input */}
                    <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2" htmlFor="note-tags"><TagIcon className="h-5 w-5" />Etiketler</label>
                         <div className="flex flex-wrap items-center gap-2 p-2 min-h-[40px] bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                            {tags.map(tag => (
                                <div key={tag} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100">
                                        &times;
                                    </button>
                                </div>
                            ))}
                             <input type="text" id="note-tags" placeholder={tags.length === 0 ? "Etiket ekle..." : ""} onKeyDown={(e) => {
                                 if (e.key === 'Enter' && e.currentTarget.value) {
                                     e.preventDefault();
                                     addTag(e.currentTarget.value.trim());
                                     e.currentTarget.value = '';
                                 }
                             }} className="flex-grow bg-transparent focus:outline-none p-1" />
                         </div>
                    </div>

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