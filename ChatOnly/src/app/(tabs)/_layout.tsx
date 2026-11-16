import React from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#4F46E5", // Indigo-600
        tabBarInactiveTintColor: "#9CA3AF", // Gray-400
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#F3F4F6",
          height: 65 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
      }}
    >
      {/* 1. Chats Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              size={size}
            //   color={color}
            />
          ),
        }}
      />

      {/* 2. Middle '+' Tab (Elevated Circle) */}
      <Tabs.Screen
        name="new-chat"
        options={{
          title: "",
          tabBarIcon: () => (
            <View className="w-12 h-12 rounded-full bg-indigo-600 items-center justify-center shadow-lg shadow-indigo-300 -mt-3">
              <Ionicons name="add" size={28} color="#FFFFFF" />
            </View>
          ),
        }}
      />

      {/* 3. Settings Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={size}
            //   color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
