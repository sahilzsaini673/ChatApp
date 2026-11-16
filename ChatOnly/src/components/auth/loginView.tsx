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

interface LoginViewProps {
  email: string;
  setEmail: (text: string) => void;
  password: string;
  setPassword: (text: string) => void;
  isLoading: boolean;
  errorMessage: string | null;
  onSubmit: () => void;
  onGooglePress: () => void;
  onRegisterPress: () => void;
  onForgotPassword: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  errorMessage,
  onSubmit,
  onGooglePress,
  onRegisterPress,
  onForgotPassword,
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
          {/* TOP SECTION: Cartoon Header (Shrinks when keyboard opens) */}
          <View
            className={`bg-indigo-100 items-center justify-center transition-all ${
              isKeyboardVisible ? "h-20 pt-2" : "h-72 pt-8"
            }`}
          >
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
              }}
              className={isKeyboardVisible ? "w-14 h-14" : "w-52 h-52"}
              contentFit="contain"
              transition={200}
            />
          </View>

          {/* BOTTOM SECTION: Premium Curved Container */}
          <View className="-mt-8 bg-white rounded-t-[36px] px-7 pt-7 pb-10 shadow-2xl flex-1 justify-between">
            <View>
              {/* Header Title */}
              <Text className="text-2xl font-extrabold text-gray-900">
                Welcome Back
              </Text>
              <Text className="text-sm text-gray-500 mt-1 mb-6">
                Log in to continue chatting with your friends
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
              <View className="mb-4">
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

              {/* Password Input */}
              <View className="mb-2">
                <Text className="text-xs font-bold uppercase text-gray-500 mb-1.5 tracking-wider">
                  Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-base text-gray-900"
                />
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity
                onPress={onForgotPassword}
                className="self-end mb-6 py-1"
              >
                <Text className="text-xs font-semibold text-indigo-600">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Log In Button */}
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
                    Log In
                  </Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center my-6">
                <View className="flex-1 h-[1px] bg-gray-200" />
                <Text className="mx-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Or continue with
                </Text>
                <View className="flex-1 h-[1px] bg-gray-200" />
              </View>

              {/* Google Button */}
              <TouchableOpacity
                onPress={onGooglePress}
                activeOpacity={0.8}
                className="w-full flex-row items-center justify-center border border-gray-200 bg-white py-3.5 rounded-2xl shadow-sm"
              >
                <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center mr-3">
                  <Text className="text-white font-black text-xs">G</Text>
                </View>
                <Text className="text-gray-700 text-sm font-bold">
                  Continue with Google
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer: Link to Register */}
            <View className="flex-row justify-center mt-7">
              <Text className="text-sm text-gray-500">
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={onRegisterPress}>
                <Text className="text-sm font-bold text-indigo-600">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginView;