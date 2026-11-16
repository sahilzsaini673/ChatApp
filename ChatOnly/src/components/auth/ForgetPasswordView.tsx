import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Image } from "expo-image";

interface ForgetPasswordViewProps {
  email: string;
  setEmail: (text: string) => void;
  isLoading: boolean;
  errorMessage: string | null;
  onSubmit: () => void;
  onBackToLogin: () => void;
}

const ForgetPasswordView: React.FC<ForgetPasswordViewProps> = ({
  email,
  setEmail,
  isLoading,
  errorMessage,
  onSubmit,
  onBackToLogin,
}) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showListener = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideListener = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
      className="flex-1 bg-indigo-50"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* TOP SECTION: Illustration that shrinks on keyboard open */}
          <View
            className={`bg-indigo-100 items-center justify-center transition-all ${
              isKeyboardVisible ? "h-20 pt-2" : "h-72 pt-8"
            }`}
          >
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80",
              }}
              className={isKeyboardVisible ? "w-14 h-14" : "w-48 h-48"}
              contentFit="contain"
              transition={200}
            />
          </View>

          {/* BOTTOM SECTION: Premium Curved Container */}
          <View className="-mt-8 bg-white rounded-t-[36px] px-7 pt-7 pb-10 shadow-2xl flex-1 justify-between">
            <View>
              {/* Header Title & Subtitle */}
              <Text className="text-2xl font-extrabold text-gray-900">
                Forgot Password?
              </Text>
              <Text className="text-sm text-gray-500 mt-2 mb-6 leading-5">
                Don't worry! Enter your registered email address and we'll send you an OTP to reset your password.
              </Text>

              {/* Error Message Alert */}
              {errorMessage ? (
                <View className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-5 flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-red-500 mr-2.5" />
                  <Text className="text-red-600 text-sm font-medium flex-1">
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              {/* Email Address Input */}
              <View className="mb-6">
                <Text className="text-xs font-bold uppercase text-gray-500 mb-1.5 tracking-wider">
                  Email Address
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="sahil@gmail.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-base text-gray-900"
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={onSubmit}
                disabled={isLoading}
                activeOpacity={0.85}
                className="w-full bg-indigo-600 py-4 rounded-2xl items-center justify-center shadow-lg shadow-indigo-200"
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white text-base font-bold tracking-wide">
                    Send OTP
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer Link: Back to Login */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-sm text-gray-500">
                Remember your password?{" "}
              </Text>
              <TouchableOpacity onPress={onBackToLogin}>
                <Text className="text-sm font-bold text-indigo-600">
                  Log In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ForgetPasswordView;