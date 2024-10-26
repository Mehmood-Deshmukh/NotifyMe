import cron from "node-cron";
import { tasks, users } from "../drizzle/schema.js";
import db from "../config/db.js";
import { eq } from "drizzle-orm";
import sendEmail from "./emailService.js";
import { sendNotificationsToUser } from "./webPushService.js";

const scheduledTasks = new Map();

export const scheduleNotification = async (task) => {
  const { id, taskName, dueDate } = task;
  const reminderDate = new Date(dueDate);

  await scheduleReminder(reminderDate, id, taskName, task.userId, 60, "Task Due in 1 Hour");
  await scheduleReminder(reminderDate, id, taskName, task.userId, 30, "Task Due in 30 Minutes");
  await scheduleReminder(reminderDate, id, taskName, task.userId, 15, "Task Due in 15 Minutes");
};

const scheduleReminder = async (dueDate, taskId, taskName, userId, minutesBefore, title) => {
  const reminderTime = new Date(dueDate.getTime() - minutesBefore * 60000);
  const cronPattern = `${reminderTime.getMinutes()} ${reminderTime.getHours()} ${reminderTime.getDate()} ${reminderTime.getMonth() + 1} *`;

  const job = cron.schedule(cronPattern, async () => {
    console.log(`Processing reminder for task: ${taskName}`);
    
    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const userEmail = user[0].email;


      await sendEmail({
        to: userEmail,
        template: 'taskReminder',
        data: {
          taskName,
          timeLeft: `${minutesBefore} minutes`
        }
      });

      const description = `Task "${taskName}" is due in ${minutesBefore} minutes`;
      await sendNotificationsToUser(userId, title, description, taskId);

    } catch (error) {
      console.error("Error in reminder job:", error);
    }
  });

  scheduledTasks.set(`${taskId}-${minutesBefore}`, job);
  console.log(`Scheduled notification for task ${taskId} at ${minutesBefore} minutes before`);
};


export const cancelScheduledNotification = (taskId) => {
  [60, 30, 15].forEach(minutes => {
    const jobKey = `${taskId}-${minutes}`;
    const job = scheduledTasks.get(jobKey);
    if (job) {
      job.stop();
      scheduledTasks.delete(jobKey);
      console.log(`Cancelled ${minutes}-minute reminder for task ${taskId}`);
    }
  });
};