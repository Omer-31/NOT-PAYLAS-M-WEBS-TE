import { API_URL } from "../config";

export type PopularQuery = {
  page?: number;
  limit?: number;
  course?: string;
  type?: string; // pdf | image | doc | other
};

export async function getPopularNotes(params: PopularQuery = {}) {
  const url = new URL(`${API_URL}/popular`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch popular notes');
  return res.json(); // { items, page, limit, total, computedAt }
}
