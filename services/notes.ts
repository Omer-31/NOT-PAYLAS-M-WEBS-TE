import { API_URL } from "../config";

export async function getNotes() {
  const res = await fetch(`${API_URL}/notes`);
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
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
