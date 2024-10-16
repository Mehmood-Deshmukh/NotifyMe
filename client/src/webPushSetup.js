async function registerServiceWorker() {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js"
      );
      console.log("Service Worker registered successfully:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }
}

async function subscribeToPushNotifications(swRegistration, user) {
  try {

    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.REACT_APP_VAPID_PUBLIC_KEY
      ),
    });
    console.log("Push notification subscription:", subscription);

    await sendSubscriptionToServer(subscription, user);

    return subscription;
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
  }
}

async function sendSubscriptionToServer(subscription, user) {
  const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${user.token}`
    },
    body: JSON.stringify(subscription),
  });

  console.log(response);

  if (!response.ok) {
    throw new Error("Failed to send subscription to server");
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function setupWebPush(user) {
  const swRegistration = await registerServiceWorker();
  if (swRegistration) {
    await subscribeToPushNotifications(swRegistration, user);
  }
}
