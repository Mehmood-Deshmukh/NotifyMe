import webpush from 'web-push';
import dotenv from 'dotenv';
import { notifications, subscriptions } from '../drizzle/schema.js';
import db from '../config/db.js';
import { eq } from 'drizzle-orm';
dotenv.config();


export const setupWebPush = () => {
  webpush.setVapidDetails(
    'mailto:your-email@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
};
export const createNotificationRecord = async (userId, taskId, title, description) => {
  try {
    const [notification] = await db
      .insert(notifications)
      .values({
        userId,
        taskId,
        title,
        description,
        status: 'pending',
        isRead: false,
        sentAt: false
      })
      .returning();
    
    return notification;
  } catch (error) {
    console.error("Error creating notification record:", error);
    throw error;
  }
};


export const sendPushNotification = async (subscription, payload, notificationId) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    await db
      .update(notifications)
      .set({ 
        status: 'sent', 
        sentAt: true 
      })
      .where(eq(notifications.id, notificationId));
  } catch (error) {
    console.error("Error sending push notification:", error);
    await db
      .update(notifications)
      .set({ 
        status: 'failed',
        sentAt: false 
      })
      .where(eq(notifications.id, notificationId));
    throw error;
  }
};

export const getUserSubscriptions = async (userId) => {
  try {
    const userSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));

    return userSubscriptions.map(subscription => ({
      endpoint: subscription.endpoint,
      keys: {
        auth: subscription.keysAuth,
        p256dh: subscription.keysP256dh,
      }
    }));
  } catch (error) {
    console.error("Error fetching user subscriptions:", error);
    return [];
  }
};

export const sendNotificationsToUser = async (userId, title, description, taskId = null) => {
  try {
    const notification = await createNotificationRecord(userId, taskId, title, description);
   
    const userSubscriptions = await getUserSubscriptions(userId);

    const payload = {
      title,
      body: description
    };

    const pushPromises = userSubscriptions.map(subscription => 
      sendPushNotification(subscription, payload, notification.id)
    );

    await Promise.all(pushPromises);
    return true;
  } catch (error) {
    console.error("Error sending notifications to user:", error);
    return false;
  }
};