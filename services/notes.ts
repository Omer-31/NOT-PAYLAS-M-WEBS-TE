import { API_URL } from "../config";

export type NotesQuery = {
  q?: string;
  course?: string;
  type?: string;
  sort?: 'popular' | 'newest' | 'oldest' | 'highest_rated';
  page?: number;
  limit?: number;
  userId?: number;
};

export async function getNotes(params: NotesQuery = {}) {
  const url = new URL(`${API_URL}/notes`);
  const entries = Object.entries(params) as [string, any][];
  for (const [k, v] of entries) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json(); // { items, page, limit, total }
}

export async function getNoteById(id: number) {
  const res = await fetch(`${API_URL}/notes/${id}`);
  if (!res.ok) throw new Error("Failed to fetch note");
  return res.json();
}

export async function createNote(noteData: {
  title: string;
  description: string;
  course: string;
  type: string;
  filePath: string;
  fileMime: string;
  fileSize: number;
}, token: string) {
  const res = await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(noteData)
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create note");
  }
  
  return res.json();
}

// Preferred: FormData-based note creation matching backend multer handler
export async function createNoteFormData(params: {
  file: File;
  title: string;
  description: string;
  course: string;
  tags?: string[];
}, token: string) {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('title', params.title);
  formData.append('description', params.description);
  formData.append('course', params.course);
  if (params.tags && params.tags.length > 0) {
    // Append tags as repeated 'tags' fields so that backend can parse into array
    for (const tag of params.tags) {
      formData.append('tags', tag);
    }
  }

  const res = await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) {
    let message = 'Failed to create note';
    try {
      const err = await res.json();
      message = err?.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}
