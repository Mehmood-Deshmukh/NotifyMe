import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js'
import { setupWebPush } from './services/webPushService.js';
import { setupCronJobs } from './services/cronService.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

setupWebPush();
setupCronJobs();

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/subscribe', subscriptionRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Notification Manager App with Supabase and Drizzle ORM');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;