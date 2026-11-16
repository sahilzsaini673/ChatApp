import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

export interface ChatItem {
  _id: string;
  otherUser: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  lastMessage?: {
    text: string;
    createdAt: string;
  };
  updatedAt: string;
}

interface ChatListViewProps {
  chats: ChatItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onChatPress: (chatId: string, otherUserName: string, otherUserAvatar?: string) => void;
  onNewChatPress: () => void;
}

export const ChatListView: React.FC<ChatListViewProps> = ({
  chats,
  isLoading,
  isRefreshing,
  onRefresh,
  onChatPress,
  onNewChatPress,
}) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
        <View>
          <Text className="text-2xl font-extrabold text-gray-900">Chats</Text>
          <Text className="text-xs text-gray-400 mt-0.5">Stay connected</Text>
        </View>
        <TouchableOpacity
          onPress={onNewChatPress}
          className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center"
        >
          <Ionicons name="create-outline" size={22} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : chats.length === 0 ? (
        /* Empty State */
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-indigo-50 items-center justify-center mb-4">
            <Ionicons name="chatbubble-ellipses-outline" size={40} color="#4F46E5" />
          </View>
          <Text className="text-lg font-bold text-gray-800 text-center">
            No chats yet
          </Text>
          <Text className="text-sm text-gray-400 text-center mt-1 mb-6 leading-5">
            Tap the + button to search someone by their email and start a conversation.
          </Text>
          <TouchableOpacity
            onPress={onNewChatPress}
            className="bg-indigo-600 px-6 py-3 rounded-2xl shadow-md shadow-indigo-200"
          >
            <Text className="text-white font-semibold">Start a chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Chat List */
        <FlatList
          data={chats}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const initial = item.otherUser?.name?.[0]?.toUpperCase() || "?";
            const lastText = item.lastMessage?.text || "No messages yet";

            return (
              <TouchableOpacity
                onPress={() => onChatPress(item._id, item.otherUser.name, item.otherUser.avatar)}
                activeOpacity={0.7}
                className="flex-row items-center justify-between px-6 py-4 border-b border-gray-50"
              >
                {/* Left side: Avatar + Name + Last Message */}
                <View className="flex-row items-center flex-1 mr-3">
                  {item.otherUser.avatar ? (
                    <Image
                      source={{ uri: item.otherUser.avatar }}
                      style={{ width: 48, height: 48, borderRadius: 24, marginRight: 16 }}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <View className="w-12 h-12 rounded-full bg-indigo-100 items-center justify-center mr-4">
                      <Text className="text-base font-bold text-indigo-700">
                        {initial}
                      </Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                      {item.otherUser.name}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
                      {lastText}
                    </Text>
                  </View>
                </View>

                {/* Right side: Timestamp */}
                {item.lastMessage?.createdAt ? (
                  <Text className="text-[11px] text-gray-400 self-start mt-1">
                    {new Date(item.lastMessage.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default ChatListView;
