import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskControllers.js';
import authenticateToken from '../middleware/authToken.js';

const router = express.Router();

router.use(authenticateToken);


router.get('/', authenticateToken, getTasks);
router.post('/', authenticateToken, createTask);
router.put('/:id', authenticateToken, updateTask);
router.delete('/:id',authenticateToken, deleteTask);

export default router;
