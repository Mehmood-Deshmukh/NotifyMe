import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Notification Manager App with Supabase and Drizzle ORM');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});