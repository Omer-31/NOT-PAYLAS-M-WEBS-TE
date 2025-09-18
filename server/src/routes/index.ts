import { Router } from 'express';
import { router as auth } from './modules/auth';
import { router as notes } from './modules/notes';
import { router as users } from './modules/users';
import { router as leaderboard } from './modules/leaderboard';
import { router as ratings } from './modules/ratings';
import { router as favorites } from './modules/favorites';
import { router as comments } from './modules/comments';
import { router as announcements } from './modules/announcements';
import { router as forum } from './modules/forum';

export const router = Router();

router.use('/auth', auth);
router.use('/notes', notes);
router.use('/users', users);
router.use('/leaderboard', leaderboard);
router.use('/ratings', ratings);
router.use('/favorites', favorites);
router.use('/comments', comments);
router.use('/announcements', announcements);
router.use('/forum', forum);


