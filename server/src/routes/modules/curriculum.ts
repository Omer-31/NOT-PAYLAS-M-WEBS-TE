import { Router } from 'express';
import { CURRICULUM } from '../../data/curriculum';

export const router = Router();

router.get('/courses', (req, res) => {
  const faculty = String(req.query.faculty || '');
  const department = String(req.query.department || '');
  const classYear = String(req.query.classYear || '');

  if (!faculty || !department || !classYear) {
    return res.status(400).json({ message: 'faculty, department ve classYear zorunludur' });
  }

  const fac = (CURRICULUM as any)[faculty];
  if (!fac) return res.json([]);
  const dep = fac[department] || fac['Diğer'];
  if (!dep) return res.json([]);
  const courses = dep[classYear] || [];
  return res.json(courses);
});

router.get('/map', (_req, res) => {
  res.json(CURRICULUM);
});
