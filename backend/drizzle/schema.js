import { pgTable, serial, text, varchar, boolean, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core';

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey().notNull(),
  userId: uuid('user_id').notNull().references(() => users.id),
  taskId: serial('task_id').references(() => tasks.id),
  timetableId: serial('timetable_id').references(() => timetables.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: varchar('status').notNull(),
  isRead: boolean('is_read').notNull(),
  createdAt: timestamp('created_at').notNull().default('now()'),
  sentAt: boolean('sent_at').notNull()
});

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey().notNull(),
  userId: uuid('user_id').notNull().references(() => users.id),
  endpoint: text('endpoint').notNull(),
  keysAuth: varchar('keys_auth').notNull(),
  keysP256dh: varchar('keys_p256dh').notNull(),
  createdAt: timestamp('created_at').notNull().default('now()'),
  updatedAt: timestamp('updated_at').notNull().default('now()')
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey().notNull(),
  userId: uuid('user_id').notNull().references(() => users.id),
  taskName: varchar('task_name').notNull(),
  dueDate: timestamp('due_date').notNull(),
  isCompleted: boolean('is_completed').notNull(),
  createdAt: timestamp('created_at').notNull().default('now()'),
  updatedAt: timestamp('updated_at').notNull().default('now()')
});

export const timetables = pgTable('timetables', {
  id: serial('id').primaryKey().notNull(),
  userId: uuid('user_id').notNull().references(() => users.id),
  fileData: text('file_data').notNull(),
  scheduleData: jsonb('schedule_data').notNull(),
  createdAt: timestamp('created_at').notNull().default('now()'),
  updatedAt: timestamp('updated_at').notNull().default('now()')
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().notNull(),
  email: varchar('email').notNull(),
  firstname: varchar('firstname').notNull(),
  lastname: varchar('lastname'),
  createdAt: timestamp('created_at').notNull().default('now()'),
  updatedAt: timestamp('updated_at').notNull().default('now()')
});
