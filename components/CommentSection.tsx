/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Comment } from '../data/mockData';

interface CommentSectionProps {
    initialComments: Comment[];
    noteId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ initialComments, noteId }) => {
    const { currentUser } = useAuth();
    const [comments, setComments] = useState<Comment[]>(initialComments || []);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);

    // Load comments from API
    const loadComments = async () => {
        setIsLoadingComments(true);
        try {
            const response = await fetch(`http://localhost:3000/api/notes/${noteId}`);
            if (response.ok) {
                const noteData = await response.json();
                setComments(noteData.comments || []);
            }
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setIsLoadingComments(false);
        }
    };

    // Load comments when component mounts
    useEffect(() => {
        loadComments();
    }, [noteId]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() && currentUser && !isSubmitting) {
            setIsSubmitting(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/api/comments/${noteId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ content: newComment })
                });

                if (response.ok) {
                    const newCommentData = await response.json();
                    setComments([newCommentData, ...comments]);
                    setNewComment('');
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Yorum eklenirken hata oluştu');
                }
            } catch (error) {
                console.error('Comment error:', error);
                alert('Yorum eklenirken hata oluştu');
            } finally {
                setIsSubmitting(false);
            }
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">{comments.length} Yorum</h3>
            
            {/* New Comment Form */}
            {currentUser && (
                <form onSubmit={handleCommentSubmit} className="flex items-start gap-4 mb-6">
                    <span className="bg-blue-100 text-blue-800 text-sm font-semibold h-10 w-10 flex items-center justify-center rounded-full dark:bg-blue-900 dark:text-blue-300 flex-shrink-0">
                        {currentUser.email.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex-grow">
                         <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Yorumunu ekle..."
                            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
                            rows={2}
                        />
                        <button type="submit" disabled={!newComment.trim() || isSubmitting} className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Gönderiliyor...' : 'Yorum Yap'}
                        </button>
                    </div>
                </form>
            )}

            {/* Comments List */}
            <div className="space-y-6">
                {isLoadingComments ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">Yorumlar yükleniyor...</span>
                    </div>
                ) : (
                    comments.map(comment => (
                    <div key={comment.id} className="flex items-start gap-4">
                        <span className="bg-gray-200 text-gray-700 text-sm font-semibold h-10 w-10 flex items-center justify-center rounded-full dark:bg-gray-600 dark:text-gray-200 flex-shrink-0">
                           {comment.user ? comment.user.charAt(0).toUpperCase() : 'U'}
                        </span>
                        <div className="flex-grow">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm text-gray-800 dark:text-white">{comment.user || 'Bilinmeyen'}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('tr-TR') : 'Şimdi'}
                                </p>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">{comment.content || comment.text}</p>
                        </div>
                    </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;