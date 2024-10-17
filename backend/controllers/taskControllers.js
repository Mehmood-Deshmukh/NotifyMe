import { tasks } from '../drizzle/schema.js';
import db from '../config/db.js';
import { eq } from 'drizzle-orm';
import { scheduleNotification, cancelScheduledNotification } from '../services/cronService.js';

export const getTasks = async (req, res) => {
  try {
    const userTasks = await db.select().from(tasks).where(eq(tasks.userId, req.user.id));
    res.json({ tasks: userTasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const createTask = async (req, res) => {
  const { taskName, dueDate, reminderTime } = req.body;
  
  if (!taskName || !dueDate || !reminderTime) {
    return res.status(400).json({ error: 'Task name, due date, and reminder time are required' });
  }

  try {

    const formattedDueDate =new Date(dueDate);
    const formattedReminderTime = new Date(reminderTime);

    console.log('formattedDueDate',formattedDueDate);
    console.log('formattedReminderTime',formattedReminderTime);


    const [newTask] = await db.insert(tasks).values({
      userId: req.user.id,
      taskName,
      dueDate: formattedDueDate,
      reminderTime: formattedReminderTime,
      isCompleted: false
    }).returning();

    scheduleNotification(newTask);
    res.status(201).json({ task: newTask });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { taskName, dueDate, reminderTime, isCompleted } = req.body;

  try {
    const [updatedTask] = await db.update(tasks)
      .set({ 
        taskName, 
        dueDate: new Date(dueDate), 
        reminderTime: new Date(reminderTime),
        isCompleted: isCompleted ?? false,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, parseInt(id)))
      .returning();

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    scheduleNotification(updatedTask);
    res.json({ task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const [deletedTask] = await db.delete(tasks)
      .where(eq(tasks.id, parseInt(id)))
      .returning();

    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    cancelScheduledNotification(deletedTask.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};