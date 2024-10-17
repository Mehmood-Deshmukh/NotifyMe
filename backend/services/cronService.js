import cron from "node-cron";
import { tasks, subscriptions } from "../drizzle/schema.js";
import db from "../config/db.js";
import { eq, lte } from "drizzle-orm";
import { sendNotification } from "./webPushService.js";

export const setupCronJobs = () => {
  // Run every minute
  console.log("Setting up cron jobs");
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    const dueTasks = await db
      .select()
      .from(tasks)
      .where(lte(tasks.reminderTime, now));

    for (const task of dueTasks) {
      console.log(`Task ${task.id}: ${task.taskName} is due`);
      const userSubscriptions = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, task.userId));

      for (const subscription of userSubscriptions) {
        await sendNotification({
          endpoint: subscription.endpoint,
          keys: {
            auth: subscription.keysAuth,
            p256dh: subscription.keysP256dh,
          }
        }, {
          title: "Task Due",
          body: task.taskName,
        });
      }

      // Mark the task as notified or delete it, depending on your requirements
      await db.delete(tasks).where(eq(tasks.id, task.id));
    }
  });
};

export const scheduleNotification = async (task) => {
  const { id, taskName, reminderTime } = task;
  console.log(`Scheduling notification for task ${id}: ${taskName} at ${new Date(reminderTime)}`);
  // The task is already saved in the database, so we don't need to do anything else here
};

export const cancelScheduledNotification = (taskId) => {
  console.log(`Cancelled scheduled notification for task ${taskId}`);
  // The task will be deleted from the database in the deleteTask function,
  // so we don't need to do anything else here
};