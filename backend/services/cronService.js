import cron from "node-cron";
import { subscriptions, tasks } from "../drizzle/schema.js";
import db from "../config/db.js";
import { eq, lte } from "drizzle-orm";
import { sendNotification } from "./webPushService.js";
import webpush from 'web-push';

const scheduledTasks = new Map();

export const setupCronJobs = () => {
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    console.log(`Checking for due tasks at: ${now.toUTCString()}`);
    const dueTasks = await db
      .select()
      .from(tasks)
      .where(lte(tasks.reminderTime, now.toISOString()));
    
    for (const task of dueTasks) {
      console.log(`Processing due task: ${task.id} - ${task.taskName}`);
      const userSubscription = await getUserSubscription(task.userId);
      if (userSubscription) {
        await sendNotification(userSubscription, {
          title: "Task Due",
          body: task.taskName,
        });
      }
      await db.delete(tasks).where(eq(tasks.id, task.id));
    }
  });
};

export const scheduleNotification = async (task) => {
  const { id, taskName, reminderTime } = task;
  const reminderDate = new Date(reminderTime);
  
  const cronPattern = `${reminderDate.getUTCMinutes()} ${reminderDate.getUTCHours()} ${reminderDate.getUTCDate()} ${reminderDate.getUTCMonth() + 1} *`;
  
  console.log(`Scheduling notification for task ${id} with cron pattern: ${cronPattern}`);
  console.log(`Current date: ${new Date().toUTCString()}`);
  console.log(`Reminder date: ${reminderDate.toUTCString()}`);
  
  const job = cron.schedule(cronPattern, async () => {
    console.log(`Sending notification for task: ${taskName}`);
    try {
      const userSubscriptions = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, task.userId));
      
      for (const subscription of userSubscriptions) {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            auth: subscription.keysAuth,
            p256dh: subscription.keysP256dh,
          },
        };
        const payload = JSON.stringify({
          title: "Task Reminder",
          body: `Don't forget: ${taskName}`,
        });
        await webpush.sendNotification(pushSubscription, payload);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  });
  
  scheduledTasks.set(id, job);
};

export const cancelScheduledNotification = (taskId) => {
  const job = scheduledTasks.get(taskId);
  if (job) {
    job.stop();
    scheduledTasks.delete(taskId);
    console.log(`Cancelled scheduled notification for task ${taskId}`);
  }
};

export const getUserSubscription = async (userId) => {
  try {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);
    
    if (subscription) {
      return JSON.parse(subscription.subscription);
    }
    return null;
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    return null;
  }
};