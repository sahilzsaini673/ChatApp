import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import API_BASE_URL from "@/config/api";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

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

  // 3. Get the unique Expo Push Token and send to backend
  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const pushToken = tokenData.data;

    const authToken = await SecureStore.getItemAsync("ACCESS_TOKEN_KEY");
    if (authToken && pushToken) {
      await fetch(`${API_BASE_URL}/users/push-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ pushToken }),
      });
    }
  } catch (error) {
    console.error("Error obtaining push token:", error);
  }
}
