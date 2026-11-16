import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

export interface FoundUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface NewChatViewProps {
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  users: FoundUser[];
  isLoading: boolean;
  isStartingChat: boolean;
  onSelectUser: (user: FoundUser) => void;
}

export const NewChatView: React.FC<NewChatViewProps> = ({
  searchQuery,
  setSearchQuery,
  users,
  isLoading,
  isStartingChat,
  onSelectUser,
}) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-100">
        <Text className="text-2xl font-extrabold text-gray-900">New Message</Text>
        <Text className="text-xs text-gray-400 mt-0.5">
          Find users by their registered email address
        </Text>
      </View>

      {/* Search Input */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search email (e.g. sahil@gmail.com)"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className="flex-1 ml-3 text-base text-gray-900"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* User Results */}
      {isLoading ? (
        <View className="py-10 items-center justify-center">
          <ActivityIndicator size="small" color="#4F46E5" />
        </View>
      ) : searchQuery.length > 0 && users.length === 0 ? (
        <View className="py-12 items-center justify-center">
          <Text className="text-sm text-gray-400">No users found with this email</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const initial = item.name?.[0]?.toUpperCase() || "?";

            return (
              <TouchableOpacity
                onPress={() => onSelectUser(item)}
                disabled={isStartingChat}
                activeOpacity={0.7}
                className="flex-row items-center justify-between px-6 py-4 border-b border-gray-50"
              >
                <View className="flex-row items-center flex-1 mr-3">
                  <View className="w-12 h-12 rounded-full bg-indigo-100 items-center justify-center mr-4">
                    <Text className="text-base font-bold text-indigo-700">
                      {initial}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={1}>
                      {item.email}
                    </Text>
                  </View>
                </View>

                <View className="bg-indigo-50 px-4 py-2 rounded-xl">
                  <Text className="text-xs font-bold text-indigo-600">Chat</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default NewChatView;