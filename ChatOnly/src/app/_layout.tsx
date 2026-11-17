import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { checkAuthStatus } from "@/utils/auth.utils";
import "../../global.css";
import * as Notifications from "expo-notifications";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { registerForPushNotification } from "@/utils/notification.utils";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    async function verifyAndNavigate() {
      try {
        const isAuthenticated = await checkAuthStatus();

        if (isAuthenticated) {
          registerForPushNotification();
          router.replace("/(tabs)" as any);
        }
      } catch (error) {
        console.log("Auth navigation error")
      } finally {
        await SplashScreen.hideAsync().catch(() => { });
      }
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const chatId = response.notification.request.content.data?.chatId;
        if (chatId) {
          router.push(`/chat/${chatId}` as any);
        }
      });

    verifyAndNavigate();

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="login" />
        <Stack.Screen name="verify-otp" />
        <Stack.Screen name="forget-password" />
        <Stack.Screen name="verify-otp-for-password" />
        <Stack.Screen name="change-password" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" />
      </Stack>
    </SafeAreaProvider>
  );
}