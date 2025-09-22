/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { Note } from '../data/mockData';
import { StarIcon, ArrowLeftIcon, MagicWandIcon, QuizIcon, HeartIcon, DownloadIcon } from './icons';
import CommentSection from './CommentSection';
import FilePreview from './FilePreview';
import { generateSummary, generateQuiz } from '../services/geminiService';
import Spinner from './Spinner';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

interface NoteDetailPageProps {
    note: Note;
    onBack: () => void;
}

const RatingSystem: React.FC<{ rating: number }> = ({ rating }) => {
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`h-6 w-6 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                ))}
            </div>
            <span className="text-lg font-bold text-gray-700 dark:text-gray-300">{rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">(25 oy)</span>
        </div>
    );
};

interface Quiz {
    question: string;
    options: string[];
    answer: string;
}

const QuizDisplay: React.FC<{ quiz: Quiz[] }> = ({ quiz }) => {
    const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>(Array(quiz.length).fill(null));
    const [showResults, setShowResults] = useState(false);

    const handleAnswerSelect = (qIndex: number, option: string) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[qIndex] = option;
        setSelectedAnswers(newAnswers);
    };

    return (
        <div className="space-y-6">
            {quiz.map((item, qIndex) => (
                <div key={qIndex}>
                    <p className="font-semibold text-gray-700 dark:text-gray-300 mb-3">{qIndex + 1}. {item.question}</p>
                    <div className="space-y-2">
                        {item.options.map((option, oIndex) => {
                            const isSelected = selectedAnswers[qIndex] === option;
                            const isCorrect = item.answer === option;
                            let buttonClass = 'w-full text-left p-3 text-sm rounded-lg border transition-colors ';
                            if (showResults) {
                                if (isCorrect) {
                                    buttonClass += 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300';
                                } else if (isSelected && !isCorrect) {
                                    buttonClass += 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300';
                                } else {
                                    buttonClass += 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
                                }
                            } else {
                                buttonClass += isSelected 
                                    ? 'bg-blue-100 border-blue-400 dark:bg-blue-900 dark:border-blue-600'
                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700';
                            }
                            return (
                                <button key={oIndex} onClick={() => !showResults && handleAnswerSelect(qIndex, option)} className={buttonClass}>
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
            <button onClick={() => setShowResults(!showResults)} className="mt-4 w-full text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                {showResults ? 'Cevapları Gizle' : 'Cevapları Göster'}
            </button>
        </div>
    );
};

const NoteDetailPage: React.FC<NoteDetailPageProps> = ({ note, onBack }) => {
    const { currentUser } = useAuth();
    const [summary, setSummary] = useState<string>('');
    const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    const [quiz, setQuiz] = useState<Quiz[] | null>(null);
    const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(false);
    const [quizError, setQuizError] = useState<string | null>(null);

    const [userRating, setUserRating] = useState<number | null>(null);
    const [isFavorited, setIsFavorited] = useState<boolean>(false);
    const [isRating, setIsRating] = useState<boolean>(false);
    const [isFavoriting, setIsFavoriting] = useState<boolean>(false);

    const handleGenerateSummary = async () => {
        setIsLoadingSummary(true);
        setSummaryError(null);
        setSummary('');
        try {
            const result = await generateSummary(note.description);
            setSummary(result);
        } catch (error) {
            setSummaryError("Özet oluşturulurken bir hata oluştu.");
        } finally {
            setIsLoadingSummary(false);
        }
    };
    
    const handleGenerateQuiz = async () => {
        setIsLoadingQuiz(true);
        setQuizError(null);
        setQuiz(null);
        try {
            const result = await generateQuiz(note.description);
            setQuiz(result);
        } catch (error) {
            setQuizError("Sınav oluşturulurken bir hata oluştu.");
        } finally {
            setIsLoadingQuiz(false);
        }
    };

    const handleRate = async (score: number) => {
        if (!currentUser) return;
        
        setIsRating(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/ratings/${note.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ score })
            });
            
            if (response.ok) {
                setUserRating(score);
                // Refresh note data or update rating display
            }
        } catch (error) {
            console.error('Rating error:', error);
        } finally {
            setIsRating(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (!currentUser) return;
        
        setIsFavoriting(true);
        try {
            const token = localStorage.getItem('token');
            const url = `http://localhost:3000/api/favorites/${note.id}`;
            const method = isFavorited ? 'DELETE' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                setIsFavorited(!isFavorited);
            }
        } catch (error) {
            console.error('Favorite error:', error);
        } finally {
            setIsFavoriting(false);
        }
    };

    // Load user's rating and favorite status
    useEffect(() => {
        if (!currentUser) return;
        
        const loadUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                
                // Load rating
                const ratingResponse = await fetch(`http://localhost:3000/api/ratings/${note.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (ratingResponse.ok) {
                    const ratingData = await ratingResponse.json();
                    setUserRating(ratingData.rating);
                }
                
                // Load favorite status (simplified - check if note is in favorites)
                const favoritesResponse = await fetch('http://localhost:3000/api/favorites', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (favoritesResponse.ok) {
                    const favorites = await favoritesResponse.json();
                    const isFav = favorites.some((fav: any) => fav.id === note.id);
                    setIsFavorited(isFav);
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };
        
        loadUserData();
    }, [note.id, currentUser]);

    return (
        <>
        <div className="space-y-8">
            <div>
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors">
                    <ArrowLeftIcon className="h-5 w-5" />
                    Tüm Notlara Geri Dön
                </button>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <span className="text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2.5 py-1 rounded-full">{note.course}</span>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-3">{note.title}</h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Yükleyen: <span className="font-medium text-gray-700 dark:text-gray-300">{note.uploader}</span></p>
                  </div>
                  {/* İndir butonu Favoriler paneline taşındı */}
                </div>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side (Preview) */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-2 flex items-center justify-center min-h-[400px] lg:min-h-[600px]">
              <FilePreview fileUrl={note.fileUrl} fileType={note.fileType} fileName={note.fileName} />
            </div>

            {/* Right side (Details) */}
            <div className="space-y-16">
                <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-6">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Not Detayları</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Puan</span>
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-500 mr-1" />
                      <span className="font-bold text-gray-800 dark:text-gray-200">{note.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">İndirme</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{note.downloads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Tür</span>
                    <span className="font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">{note.type}</span>
                  </div>
                </div>
                     <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-6">
                        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Puan Ver</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Bu notu oylayarak yazara destek ol.</p>
                        <div className="flex items-center gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleRate(star)}
                                    disabled={isRating}
                                    className={`p-1 ${userRating && star <= userRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'} transition-colors`}
                                >
                                    <StarIcon className="h-6 w-6" />
                                </button>
                            ))}
                            {userRating && (
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                    Senin puanın: {userRating}/5
                                </span>
                            )}
                        </div>
                        <RatingSystem rating={note.rating} />
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-6 relative">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Favoriler</h3>
                          <a
                            href={`${API_URL}/notes/${note.id}/download`}
                            download
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0 whitespace-nowrap"
                            title="Dosyayı indir"
                          >
                            <DownloadIcon className="h-5 w-5" />
                            <span>İndir</span>
                          </a>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Bu notu favorilerine ekle.</p>
                        <button
                          onClick={handleToggleFavorite}
                          disabled={isFavoriting}
                          className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap w-44 ${
                            isFavorited
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          title={isFavorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                        >
                          <HeartIcon className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                          <span>{isFavorited ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}</span>
                        </button>
                    </div>
                    {/* AI Summary */}
                    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <MagicWandIcon className="h-6 w-6 text-purple-500" />
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">AI Destekli Özet</h3>
                        </div>
                        
                        {isLoadingSummary ? (
                             <div className="flex flex-col items-center justify-center p-4">
                                <Spinner />
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Özet oluşturuluyor...</p>
                            </div>
                        ) : summaryError ? (
                            <p className="text-sm text-red-500">{summaryError}</p>
                        ) : summary ? (
                            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{summary}</p>
                        ) : (
                            <>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Notun içeriğini hızlıca anlamak için bir özet oluşturun.</p>
                                <button onClick={handleGenerateSummary} disabled={isLoadingSummary} className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 shadow-sm disabled:opacity-60">
                                    Özet Oluştur
                                </button>
                            </>
                        )}
                    </div>
                    {/* AI Quiz */}
                    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <QuizIcon className="h-6 w-6 text-indigo-500" />
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">AI ile Bilgini Test Et</h3>
                        </div>
                        {isLoadingQuiz ? (
                             <div className="flex flex-col items-center justify-center p-4">
                                <Spinner />
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Sınav oluşturuluyor...</p>
                            </div>
                        ) : quizError ? (
                             <p className="text-sm text-red-500">{quizError}</p>
                        ) : quiz ? (
                           <QuizDisplay quiz={quiz} />
                        ) : (
                             <>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Bu nottan çoktan seçmeli bir sınav oluşturarak öğrendiklerini pekiştir.</p>
                                <button onClick={handleGenerateQuiz} disabled={isLoadingQuiz} className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:opacity-60">
                                    Sınav Oluştur
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Description and Comments - Full Width */}
        <div className="space-y-8 mt-12">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-6">
                <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Açıklama</h3>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{note.description}</p>
            </div>
            
            {/* Comments */}
            <CommentSection initialComments={note.comments || []} noteId={note.id} />
        </div>

        </>
    );
};

export default NoteDetailPage;