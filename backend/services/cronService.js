import cron from "node-cron";
import { subscriptions, tasks } from "../drizzle/schema.js";
import db from "../config/db.js";
import { eq, lte } from "drizzle-orm";
import webpush from "web-push";

const scheduledTasks = new Map();

export const setupCronJobs = () => {
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    const dueTasks = await db
      .select()
      .from(tasks)
      .where(lte(tasks.scheduledTime, now));

    for (const task of dueTasks) {
      const userSubscription = await getUserSubscription(task.userId);
      if (userSubscription) {
        await sendNotification(userSubscription, {
          title: "Task Due",
          body: task.description,
        });
      }
      await db.delete(tasks).where(eq(tasks.id, task.id));
    }
  });
};

export const scheduleNotification = async (task) => {
  const { id, taskName, dueDate } = task;
  const reminderDate = new Date(dueDate);

  scheduleReminder(reminderDate, id, taskName, task.userId, 60, "Task Reminder 1hr before");  
  scheduleReminder(reminderDate, id, taskName,task.userId,  30, "Task Reminder 30min before"); 
  scheduleReminder(reminderDate, id, taskName, task.userId, 15, "Task Reminder 15min before"); 
};

const scheduleReminder = (dueDate, taskId, taskName, userId, minutesBefore, title) => {
  const reminderTime = new Date(dueDate.getTime() - minutesBefore * 60000);
  const cronPattern = `${reminderTime.getMinutes()} ${reminderTime.getHours()} ${reminderTime.getDate()} ${reminderTime.getMonth() + 1} *`;

  const job = cron.schedule(cronPattern, async () => {
    console.log(`Sending notification for task: ${taskName}`);
    
    try {
      const userSubscriptions = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId));

      for (const subscription of userSubscriptions) {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            auth: subscription.keysAuth,
            p256dh: subscription.keysP256dh,
          },
        };

        const payload = JSON.stringify({
          title,
          body: `Don't forget: ${taskName}`,
        });

        await webpush.sendNotification(pushSubscription, payload);
      }

      if (minutesBefore === 15) {
        scheduleTaskCompletion(dueDate, taskId);
      }

    } catch (error) {
      console.error("Error sending notification:", error);
    }
  });

  scheduledTasks.set(taskId, job);
  console.log(`Scheduled notification for task ${taskId}`);
};

const scheduleTaskCompletion = (dueDate, taskId) => {
  const completionTime = new Date(dueDate.getTime() + 15 * 60000); 

  const cronPattern = `${completionTime.getMinutes()} ${completionTime.getHours()} ${completionTime.getDate()} ${completionTime.getMonth() + 1} *`;

  const completionJob = cron.schedule(cronPattern, async () => {
    try {
      await db.update(tasks)
        .set({ isCompleted: true })
        .where(eq(tasks.id, taskId));

      console.log(`Task ${taskId} marked as completed after 15 minutes.`);
      
      completionJob.stop();
    } catch (error) {
      console.error("Error updating task as completed:", error);
    }
  });

  console.log(`Scheduled task completion for task ${taskId} 15 minutes after due date.`);
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
