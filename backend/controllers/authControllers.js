import supabase from '../config/supabase.js';
import { users } from '../drizzle/schema.js';
import db from '../config/db.js';
import { eq } from 'drizzle-orm';


const signup = async (req, res) => {
  const { email, password, name } = req.body;
  const [firstname, lastname] = name.split(' ');

  if (!email || !password || !firstname || !lastname) {
    return res.status(400).json({ error: 'Email, password, and full name are required' });
  }

  try {
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const { data: supabaseUser, error: supabaseError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { firstname, lastname }
      }
    });

    if (supabaseError) {
      return res.status(400).json({ error: supabaseError.message });
    }

    await db.insert(users).values({ 
      id: supabaseUser.user.id,
      email, 
      firstname, 
      lastname 
    });

    return res.status(201).json({ 
      message: 'User created successfully. Please check your email to confirm your account.',
      user: { email, firstname, lastname }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'An error occurred during signup' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { data: { session }, error: supabaseError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (supabaseError) {
      return res.status(400).json({ error: supabaseError.message });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user) {
      return res.status(400).json({ error: 'User not found in the database' });
    }

    const { id, email: userEmail, firstname, lastname } = user;
    return res.status(200).json({ 
      message: 'Login successful', 
      user: { id, email: userEmail, firstname, lastname },
      session 
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
};

const googleSignIn = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Google access token is required' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: credential,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { user, session } = data;

    let dbUser = await db.select().from(users).where(eq(users.id, user.id)).limit(1);

    if (dbUser.length === 0) {

      const [firstname, ...lastnameArray] = user.user_metadata.full_name.split(' ');
      const lastname = lastnameArray.join(' ');

      await db.insert(users).values({
        id: user.id,
        email: user.email,
        firstname,
        lastname
      });

      dbUser = [{ id: user.id, email: user.email, firstname, lastname }];
    }

    return res.status(200).json({
      message: 'Google sign-in successful',
      user: dbUser[0],
      session
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    return res.status(500).json({ error: 'An error occurred during Google sign-in' });
  }
};

export { signup, login, googleSignIn };