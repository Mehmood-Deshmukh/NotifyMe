import { defineConfig } from 'drizzle-kit';

import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  schema: "./drizzle/schema.js",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  out: "./db/new",
  dialect: 'postgresql',
  verbose: true,
  strict: true,
});