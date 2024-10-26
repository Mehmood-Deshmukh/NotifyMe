import express from 'express';
import { addSubscription } from '../controllers/subscriptionControllers.js';
import authenticateToken from '../middleware/authToken.js';


const router = express.Router();
router.use(authenticateToken);

router.post('/', addSubscription);

export default router;
