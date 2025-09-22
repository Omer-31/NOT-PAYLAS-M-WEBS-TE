/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface FavoriteCategory {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    favorites: number;
  };
}

export interface Note {
  id: number;
  title: string;
  description: string;
  course: string;
  type: 'pdf' | 'image' | 'doc' | 'other';
  fileUrl: string;
  fileName: string;
  fileType: string;
  rating: number;
  downloads: number;
  uploader: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
  } | null;
}
