import React, { useRef, useEffect } from "react";
import { Image } from "expo-image";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export interface MessageItem {
  _id: string;
  sender: {
    _id: string;
    name: string;
  };
  text: string;
  createdAt: string;
}

interface ChatRoomViewProps {
  recipientName: string;
  recipientAvatar?: string;
  currentUserId: string;
  messages: MessageItem[];
  inputText: string;
  setInputText: (text: string) => void;
  isLoading: boolean;
  onSend: () => void;
  onBack: () => void;
}

export const ChatRoomView: React.FC<ChatRoomViewProps> = ({
  recipientName,
  recipientAvatar,
  currentUserId,
  messages,
  inputText,
  setInputText,
  isLoading,
  onSend,
  onBack,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  // Scroll to bottom whenever new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const initial = recipientName?.[0]?.toUpperCase() || "?";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* 1. Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={onBack} className="p-2 -ml-2 mr-1">
            <Ionicons name="chevron-back" size={26} color="#1F2937" />
          </TouchableOpacity>

          {recipientAvatar ? (
            <Image
              source={{ uri: recipientAvatar }}
              style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center mr-3">
              <Text className="text-sm font-bold text-indigo-700">{initial}</Text>
            </View>
          )}

          <View>
            <Text className="text-base font-bold text-gray-900">{recipientName}</Text>
            <View className="flex-row items-center mt-0.5">
              {/* <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" /> */}
              {/* <Text className="text-xs text-gray-400">Online</Text> */}
            </View>
          </View>
        </View>
      </View>

      {/* 2. Messages List with Keyboard Handling */}
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        style={{ flex: 1 }}
        className="flex-1 bg-gray-50"
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isMine = item.sender._id === currentUserId;
              const timeString = new Date(item.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <View
                  className={`my-1.5 max-w-[80%] ${isMine ? "self-end items-end" : "self-start items-start"
                    }`}
                >
                  <View
                    className={`px-4 py-2.5 rounded-2xl ${isMine
                        ? "bg-indigo-600 rounded-tr-sm"
                        : "bg-white border border-gray-200 rounded-tl-sm"
                      }`}
                  >
                    <Text
                      className={`text-base leading-5 ${isMine ? "text-white" : "text-gray-900"
                        }`}
                    >
                      {item.text}
                    </Text>
                  </View>
                  <Text className="text-[10px] text-gray-400 mt-1 px-1">
                    {timeString}
                  </Text>
                </View>
              );
            }}
          />
        )}

        {/* 3. Bottom Input Bar */}
        <View style={{ paddingBottom: Math.max(insets.bottom, 12) }} className="px-4 py-3 pb-5 bg-white border-t border-gray-100 flex-row items-center">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            multiline
            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 max-h-24 text-base text-gray-900 mr-2"
          />

          <TouchableOpacity
            onPress={onSend}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
            style={{
              backgroundColor: inputText.trim() ? "#4F46E5" : "#E5E7EB",
            }}
            className="w-11 h-11 rounded-full items-center justify-center"
          >
            <Ionicons
              name="send"
              size={18}
              color={inputText.trim() ? "#FFFFFF" : "#9CA3AF"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatRoomView;
