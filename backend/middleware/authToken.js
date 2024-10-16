import supabase from '../config/supabase.js';
import { users } from '../drizzle/schema.js';
import db from '../config/db.js';
import { eq } from 'drizzle-orm';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log(token);
    return res.status(401).json({ error: 'Access token is required' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const [dbUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found in the database' });
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      firstname: dbUser.firstname,
      lastname: dbUser.lastname
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'An error occurred during authentication' });
  }
};

export default authenticateToken;