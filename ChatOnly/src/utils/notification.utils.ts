import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Alert, Platform } from "react-native";
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
      console.log("[PushToken] Cannot sync: missing token or authToken");
      Alert.alert(
        "Push Token Debug",
        `Cannot sync.\npushToken: ${tokenToSend ? "✅" : "❌ missing"}\nauthToken: ${authToken ? "✅" : "❌ missing"}`
      );
      return;
    }

    console.log("[PushToken] Syncing with backend...");
    const response = await fetch(`${API_BASE_URL}/users/push-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ pushToken: tokenToSend }),
    });

    const data = await response.json();
    console.log("[PushToken] Sync result:", JSON.stringify(data));
    Alert.alert(
      "Push Token Saved!",
      `Status: ${response.status}\nResult: ${JSON.stringify(data)}\nToken: ${tokenToSend?.substring(0, 40)}...`
    );
  } catch (error) {
    console.error("[PushToken] Failed to sync with backend:", error);
    Alert.alert("Push Token Sync Error", String(error));
  }
}

/**
 * Requests notification permission, retrieves Expo Push Token, and syncs with backend
 */
export async function registerForPushNotification() {
  console.log("[PushToken] registerForPushNotification called");

  if (!Device.isDevice) {
    console.log("[PushToken] Not a physical device, skipping");
    Alert.alert("Push Token", "Must use physical device");
    return;
  }

  // 1. Request notification permissions FIRST so the dialog pops up
  let finalStatus: string;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log("[PushToken] Existing permission status:", existingStatus);
    finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log("[PushToken] Requested permission, new status:", status);
      finalStatus = status;
    }
  } catch (error) {
    console.error("[PushToken] Failed to request permissions:", error);
    Alert.alert("Permission Error", String(error));
    return;
  }

  if (finalStatus !== "granted") {
    console.log("[PushToken] Permission not granted:", finalStatus);
    Alert.alert("Push Token", `Permission not granted. Status: ${finalStatus}`);
    return;
  }

  console.log("[PushToken] Permission granted! Setting up channel...");

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
      console.warn("[PushToken] Could not set Android notification channel:", channelError);
    }
  }

  // 3. Get the unique Expo Push Token using explicit fallback project ID
  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId ??
      EAS_PROJECT_ID;

    console.log("[PushToken] Getting token with projectId:", projectId);

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const pushToken = tokenData.data;
    console.log("[PushToken] Obtained Expo Push Token:", pushToken);

    if (pushToken) {
      await SecureStore.setItemAsync("PUSH_TOKEN", pushToken);
      await syncPushTokenWithBackend(pushToken);
    } else {
      Alert.alert("Push Token", "getExpoPushTokenAsync returned empty token!");
    }
  } catch (error) {
    console.error("[PushToken] Error obtaining push token:", error);
    Alert.alert("Get Token Error", String(error));
  }
}
