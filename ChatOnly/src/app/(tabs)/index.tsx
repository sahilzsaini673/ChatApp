import React, { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import ChatListView, { ChatItem } from "@/components/chat/ChatListView";
import API_BASE_URL from "@/config/api";
import { registerForPushNotification } from "@/utils/notification.utils";

export default function ChatsScreen() {
  const router = useRouter();

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchChats = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("ACCESS_TOKEN_KEY");
      const currentUserId = await SecureStore.getItemAsync("CURRENT_USER_ID");

      const response = await fetch(`${API_BASE_URL}/chats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Pick the other participant (the one whose _id does not match the logged-in user)
        const formatted: ChatItem[] = data.chats.map((c: any) => {
          const other =
            c.participants?.find((p: any) => p._id !== currentUserId) ||
            c.participants?.[0] || { name: "User", email: "" };

          return {
            _id: c._id,
            otherUser: other,
            lastMessage: c.lastMessage,
            updatedAt: c.updatedAt,
          };
        });

        setChats(formatted);
      }
    } catch (error) {
      console.error("Fetch chats error:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // useFocusEffect runs EVERY TIME this tab comes on screen (including when navigating back from a chat)
  useFocusEffect(
    useCallback(() => {
      fetchChats();
      registerForPushNotification();
    }, [fetchChats])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchChats();
  };

  const handleChatPress = (chatId: string, otherUserName: string,   otherUserAvatar?: string) => {
    router.push({
      pathname: `/chat/${chatId}` as any,
      params: { name: otherUserName, avatar: otherUserAvatar || "", },
    });
  };

  const handleNewChatPress = () => {
    router.push("/(tabs)/new-chat" as any);
  };

  return (
    <ChatListView
      chats={chats}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      onRefresh={handleRefresh}
      onChatPress={handleChatPress}
      onNewChatPress={handleNewChatPress}
    />
  );
}