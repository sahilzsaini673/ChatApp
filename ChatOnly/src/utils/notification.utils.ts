import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import API_BASE_URL from "@/config/api";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const EAS_PROJECT_ID = "e56f313b-0b9a-4ce7-8de0-2dfe32eff108";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Sends a push token to the backend for the currently authenticated user
 */
export async function syncPushTokenWithBackend(pushToken?: string) {
  try {
    const tokenToSend = pushToken || (await SecureStore.getItemAsync("PUSH_TOKEN"));
    const authToken = await SecureStore.getItemAsync("ACCESS_TOKEN_KEY");

    if (!tokenToSend || !authToken) {
      console.log("Cannot sync push token: missing pushToken or authToken");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/users/push-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ pushToken: tokenToSend }),
    });

    const data = await response.json();
    console.log("Push token sync result:", data);
  } catch (error) {
    console.error("Failed to sync push token with backend:", error);
  }
}

/**
 * Requests notification permission, retrieves Expo Push Token, and syncs with backend
 */
export async function registerForPushNotification() {
  if (!Device.isDevice) {
    console.log("Must use physical device for push notifications");
    return;
  }

  // 1. Request notification permissions FIRST so the dialog pops up
  let finalStatus: string;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
  } catch (error) {
    console.error("Failed to request notification permissions:", error);
    return;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token permission - user declined or not granted");
    return;
  }

  // 2. Set up Android Notification Channel safely (Android 8.0+)
  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#4F46E5",
      });
    } catch (channelError) {
      console.warn("Could not set Android notification channel:", channelError);
    }
  }

  // 3. Get the unique Expo Push Token using explicit fallback project ID
  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId ??
      EAS_PROJECT_ID;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const pushToken = tokenData.data;
    console.log("Obtained Expo Push Token:", pushToken);

    // Cache the push token locally in SecureStore
    if (pushToken) {
      await SecureStore.setItemAsync("PUSH_TOKEN", pushToken);
      // Attempt to sync with backend
      await syncPushTokenWithBackend(pushToken);
    }
  } catch (error) {
    console.error("Error obtaining push token:", error);
  }
}
