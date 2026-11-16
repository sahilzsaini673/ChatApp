// import React from "react";
// import { View, Text, TouchableOpacity, Alert } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRouter } from "expo-router";
// import * as SecureStore from "expo-secure-store";
// import { Ionicons } from "@expo/vector-icons";

// export default function SettingsScreen() {
//   const router = useRouter();

//   const handleLogout = async () => {
//     Alert.alert("Log Out", "Are you sure you want to log out?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Log Out",
//         style: "destructive",
//         onPress: async () => {
//           await SecureStore.deleteItemAsync("ACCESS_TOKEN_KEY");
//           await SecureStore.deleteItemAsync("REFRESH_TOKEN_KEY");
//           router.replace("/login" as any);
//         },
//       },
//     ]);
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-white px-6 py-4 justify-between">
//       <View>
//         <Text className="text-2xl font-extrabold text-gray-900 mb-6">Settings</Text>

//         <View className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100 flex-row items-center">
//           <View className="w-12 h-12 rounded-full bg-indigo-100 items-center justify-center mr-4">
//             <Ionicons name="person" size={24} color="#4F46E5" />
//           </View>
//           <View>
//             <Text className="text-base font-bold text-gray-900">My Account</Text>
//             <Text className="text-xs text-gray-400 mt-0.5">Settings coming soon</Text>
//           </View>
//         </View>
//       </View>

//       <TouchableOpacity
//         onPress={handleLogout}
//         className="w-full bg-red-50 border border-red-200 py-4 rounded-2xl items-center justify-center mb-4"
//       >
//         <Text className="text-red-600 font-bold text-base">Log Out</Text>
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// }



import React, { useState, useEffect } from "react"
import { Alert } from "react-native"
import { useRouter } from "expo-router"
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import API_BASE_URL from "@/config/api";
import SettingsView from "@/components/settings/SettingsView";


export default function SettingsScreen() {
  const router = useRouter();

  const [initialName, setInitialName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [newAvatarBase64, setNewAvatarBase64] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = async () => {
    try{
      setIsLoading(true);
      const token = await SecureStore.getItemAsync("ACCESS_TOKEN_KEY");

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if(data.success && data.user) {
        setName(data.user.name || "");
        setInitialName(data.user.name || "");
        setEmail(data.user.email || "");
        setAvatarUri(data.user.avatar || null);
      }
    } catch(error) {
      console.log("Error fetching profile");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if(!permission.granted) {
      Alert.alert(
        "Permission Denied"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      setAvatarUri(asset.uri);
      if(asset.base64) {
        setNewAvatarBase64(`data:image/jpeg;base64,${asset.base64}`);
      }
    }
  }

   const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Name cannot be empty.");
      return;
    }
    try {
      setIsSaving(true);
      const token = await SecureStore.getItemAsync("ACCESS_TOKEN_KEY");
      const body: { name?: string; avatar?: string } = {};
      if (name.trim() !== initialName) {
        body.name = name.trim();
      }
      if (newAvatarBase64) {
        body.avatar = newAvatarBase64;
      }
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setInitialName(data.user.name);
        setNewAvatarBase64(null); // Reset pending upload
        setAvatarUri(data.user.avatar);
        Alert.alert("Success", "Profile updated successfully!");
      } else {
        Alert.alert("Error", data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.log("Error updating profile:", error);
      Alert.alert("Error", "Could not connect to the server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("ACCESS_TOKEN_KEY");
          await SecureStore.deleteItemAsync("REFRESH_TOKEN_KEY");
          await SecureStore.deleteItemAsync("CURRENT_USER_ID");
          router.replace("/login" as any);
        }
      }
    ]);
  };

  const hasChanges = name.trim() !== initialName || newAvatarBase64 !== null;

  return (
    <SettingsView
      name={name}
      setName={setName}
      email={email}
      avatarUri={avatarUri}
      isLoading={isLoading}
      isSaving={isSaving}
      hasChanges={hasChanges}
      onPickImage={handlePickImage}
      onSave={handleSave}
      onLogout={handleLogout}
    />
  );
}