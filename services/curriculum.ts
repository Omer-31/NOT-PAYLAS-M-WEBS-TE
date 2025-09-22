import { API_URL } from "../config";

export async function fetchCoursesFor(params: {
  faculty: string;
  department: string;
  classYear: string;
}): Promise<string[]> {
  const url = new URL(`${API_URL}/curriculum/courses`);
  url.searchParams.set('faculty', params.faculty);
  url.searchParams.set('department', params.department);
  url.searchParams.set('classYear', params.classYear);

  const res = await fetch(url.toString());
  if (!res.ok) return [];
  try {
    const data = await res.json();
    if (Array.isArray(data)) return data as string[];
    return [];
  } catch {
    return [];
  }
}
