import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

interface SettingsViewProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  avatarUri: string | null;
  isLoading: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  onPickImage: () => void;
  onSave: () => void;
  onLogout: () => void;
}

export default function SettingsView({
  name,
  setName,
  email,
  avatarUri,
  isLoading,
  isSaving,
  hasChanges,
  onPickImage,
  onSave,
  onLogout,
}: SettingsViewProps) {
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
          className="px-6 py-4"
        >
          <View>
            <Text className="text-2xl font-extrabold text-gray-900 mb-6">
              Settings
            </Text>

            {/* Avatar Section with Camera Badge */}
            <View className="items-center mb-8">
              <TouchableOpacity
                onPress={onPickImage}
                activeOpacity={0.8}
                className="relative"
              >
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={{ width: 110, height: 110, borderRadius: 55 }}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <View className="w-28 h-28 rounded-full bg-indigo-100 items-center justify-center border-2 border-indigo-200">
                    <Ionicons name="person" size={50} color="#4F46E5" />
                  </View>
                )}

                {/* Camera icon badge */}
                <View className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-indigo-600 items-center justify-center border-2 border-white shadow">
                  <Ionicons name="camera" size={18} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <Text className="text-xs text-indigo-600 font-semibold mt-2.5">
                Tap to change photo
              </Text>
            </View>

            {/* Edit Name Input */}
            <View className="mb-5">
              <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Display Name
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:border-indigo-600">
                <Ionicons name="person-outline" size={20} color="#6B7280" className="mr-3" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-base text-gray-900 ml-2"
                />
              </View>
            </View>

            {/* Read-Only Email */}
            <View className="mb-6">
              <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Email Address
              </Text>
              <View className="flex-row items-center bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3.5">
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <Text className="text-base text-gray-500 ml-3 flex-1">{email}</Text>
                <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
              </View>
            </View>

            {/* Save Button (Enabled when changes exist) */}
            <TouchableOpacity
              onPress={onSave}
              disabled={!hasChanges || isSaving}
              activeOpacity={0.8}
              className={`w-full py-4 rounded-2xl items-center justify-center shadow-md ${
                hasChanges && !isSaving ? "bg-indigo-600 shadow-indigo-200" : "bg-gray-200"
              }`}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  className={`text-base font-bold ${
                    hasChanges ? "text-white" : "text-gray-400"
                  }`}
                >
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Log Out Button */}
          <TouchableOpacity
            onPress={onLogout}
            activeOpacity={0.8}
            className="w-full bg-red-50 border border-red-200 py-4 rounded-2xl items-center justify-center mt-6 mb-4"
          >
            <Text className="text-red-600 font-bold text-base">Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}