import { subscriptions } from "../drizzle/schema.js";
import db from '../config/db.js';
import { eq } from "drizzle-orm";

export const addSubscription = async (req, res) => {
  const { endpoint, keys } = req.body;
  const userId = req.user.id;

  if (!endpoint || !keys || !keys.auth || !keys.p256dh) {
    return res.status(400).json({ error: "Invalid subscription data." });
  }

  try {

    const existingSubscription = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
    if (existingSubscription.length > 0) {
        return res.status(400).json({ error: 'Subscription already exists' });
    }

    await db
      .insert(subscriptions)
      .values({
        userId,
        endpoint,
        keysAuth: keys.auth,
        keysP256dh: keys.p256dh,
      })

    res.status(201).json({ message: "Subscription added successfully." });
  } catch (error) {
    console.error("Error saving subscription:", error);
    res.status(500).json({ error: "Failed to save subscription." });
  }
};