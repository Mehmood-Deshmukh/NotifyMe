import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskControllers.js';
import authenticateToken from '../middleware/authToken.js';

const router = express.Router();

router.use(authenticateToken);


router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
