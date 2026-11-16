import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import API_BASE_URL from "@/config/api";
import * as SecureStore from "expo-secure-store";

// Configure how notification appear when app is in the foreground
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

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token permission!");
    return;
  }

  // 2. Get the unique Expo Push Token
  const tokenData = await Notifications.getExpoPushTokenAsync();
  const pushToken = tokenData.data;

  const authToken = await SecureStore.getItemAsync("ACCESS_TOKEN_KEY");
  if (authToken) {
    await fetch(`${API_BASE_URL}/users/push-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ pushToken }),
    });
  }
}