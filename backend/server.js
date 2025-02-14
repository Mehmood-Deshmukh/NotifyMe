/* import express from 'express';
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

export default app; */

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cluster from 'cluster';
import os from 'os';
import fileUpload from 'express-fileupload';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js'
import { setupWebPush } from './services/webPushService.js';

dotenv.config();
const numCPUs = os.cpus().length;

function startServer() {
  const app = express();
  
  app.use(express.json());
  app.use(cors());
  app.use(fileUpload({
    createParentPath: true, 
    limits: {
      fileSize: 50 * 1024 * 1024 
    },
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: '/tmp/'
  }));

  setupWebPush();


  app.use('/api/auth', authRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/subscribe', subscriptionRoutes);
  app.use('/api/timetables', timetableRoutes);

  app.get('/', (req, res) => {
    res.send('Welcome to the Notification Manager App with Supabase and Drizzle ORM');
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} running on port ${PORT}`);
  });
  
  return app;
}

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  startServer();
}

export default startServer;