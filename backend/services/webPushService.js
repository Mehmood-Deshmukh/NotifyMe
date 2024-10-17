import webpush from 'web-push';
import dotenv from 'dotenv';
import { notifications } from '../drizzle/schema.js';
dotenv.config();
export const setupWebPush = () => {
  webpush.setVapidDetails(
    'mailto:your-email@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
};
export const sendNotification = async (userId, notification) => {
  try {
    const subscription = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).first();
    
    if (subscription) {
      const payload = {
        title: notification.title,
        body: notification.description
      };
      
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      
      // Update notification status
      await db.update(notifications)
        .set({ status: 'sent', sentAt: true })
        .where(eq(notifications.id, notification.id));
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};