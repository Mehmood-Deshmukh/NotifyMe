import express from 'express';
const router = express.Router();
import { signup, login, googleSignIn } from '../controllers/authControllers.js';

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleSignIn);

export default router;