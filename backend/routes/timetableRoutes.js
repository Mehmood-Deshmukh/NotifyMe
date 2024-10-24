import express from 'express';
import authenticateToken from '../middleware/authToken.js';
import {
    getTimetables,
    uploadTimetable,
    updateTimetable,
    deleteTimetable,
    getActiveSchedules
} from '../controllers/timetableControllers.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getTimetables);
router.post('/upload', uploadTimetable);
router.put('/:id', updateTimetable);
router.delete('/:id', deleteTimetable);

router.get('/schedules', getActiveSchedules);

export default router;