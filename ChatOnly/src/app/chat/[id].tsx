import React, { useState, useEffect, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { io, Socket } from "socket.io-client";
import ChatRoomView, { MessageItem } from "@/components/chat/ChatRoomView";
import API_BASE_URL, { SOCKET_URL } from "@/config/api";

export default function ChatScreen() {
  const router = useRouter();
  const { id: chatId, name: recipientName, avatar: recipientAvatar } = useLocalSearchParams<{
    id: string;
    name: string;
    avatar?: string;
  }>();

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let socket: Socket;

    const setupChat = async () => {
      try {
        // 1. Get stored user ID & Token
        const userId = await SecureStore.getItemAsync("CURRENT_USER_ID");
        const token = await SecureStore.getItemAsync("ACCESS_TOKEN_KEY");
        if (userId) setCurrentUserId(userId);

        // 2. Fetch Message History via REST API
        const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setMessages(data.messages || []);
        }

        // 3. Connect to Socket.IO Server
        socket = io(SOCKET_URL, {
          transports: ["websocket"],
        });
        socketRef.current = socket;

        // 4. Join this specific chat room
        socket.emit("join_chat", chatId);

        // 5. Listen for incoming messages in real-time
        socket.on("receive_message", (newMessage: MessageItem) => {
          setMessages((prev) => [...prev, newMessage]);
        });
      } catch (error) {
        console.error("Chat setup error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    setupChat();

    // Cleanup when leaving the screen
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave_chat", chatId);
        socketRef.current.disconnect();
      }
    };
  }, [chatId]);

  // Send Message Handler
  const handleSend = () => {
    if (!inputText.trim() || !socketRef.current) return;

    socketRef.current.emit("send_message", {
      chatId,
      senderId: currentUserId,
      text: inputText.trim(),
    });

    setInputText("");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ChatRoomView
      recipientName={typeof recipientName === "string" ? recipientName : "Chat"}
      recipientAvatar={typeof recipientAvatar === "string" ? recipientAvatar: undefined}
      currentUserId={currentUserId}
      messages={messages}
      inputText={inputText}
      setInputText={setInputText}
      isLoading={isLoading}
      onSend={handleSend}
      onBack={handleBack}
    />
  );
}