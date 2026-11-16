import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import NewChatView, { FoundUser } from "@/components/chat/NewChatView";
import API_BASE_URL from "@/config/api";

export default function NewChatScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<FoundUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  // Search users as the user types (with 400ms debounce)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const token = await SecureStore.getItemAsync("ACCESS_TOKEN_KEY");

        const response = await fetch(
          `${API_BASE_URL}/users/search?email=${encodeURIComponent(
            searchQuery.trim().toLowerCase()
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (response.ok && data.success) {
          setUsers(data.users || []);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error("Search users error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // When a user is clicked: Get or create conversation in MongoDB and navigate
  const handleSelectUser = async (user: FoundUser) => {
    setIsStartingChat(true);

    try {
      const token = await SecureStore.getItemAsync("ACCESS_TOKEN_KEY");

      const response = await fetch(`${API_BASE_URL}/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          participantId: user._id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push({
          pathname: `/chat/${data.chat._id}` as any,
          params: { name: user.name, avatar: user.avatar || "",  },
        });
      } else {
        Alert.alert("Error", data.message || "Failed to start chat");
      }
    } catch (error) {
      Alert.alert("Error", "Could not connect to server");
    } finally {
      setIsStartingChat(false);
    }
  };

  return (
    <NewChatView
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      users={users}
      isLoading={isLoading}
      isStartingChat={isStartingChat}
      onSelectUser={handleSelectUser}
    />
  );
}