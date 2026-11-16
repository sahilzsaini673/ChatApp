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

interface VerifyOtpViewProps {
  email: string;
  otp: string;
  setOtp: (val: string) => void;
  isLoading: boolean;
  errorMessage: string | null;
  resendCountdown: number;
  isResending: boolean;
  onVerify: () => void;
  onResend: () => void;
  onChangeEmail: () => void;
}

const VerifyOtpView: React.FC<VerifyOtpViewProps> = ({
  email,
  otp,
  setOtp,
  isLoading,
  errorMessage,
  resendCountdown,
  isResending,
  onVerify,
  onResend,
  onChangeEmail,
}) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
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
                uri: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&auto=format&fit=crop&q=80",
              }}
              className={isKeyboardVisible ? "w-14 h-14" : "w-48 h-48"}
              contentFit="contain"
              transition={200}
            />
          </View>

          {/* BOTTOM SECTION: Premium Curved Container */}
          <View className="-mt-8 bg-white rounded-t-[36px] px-7 pt-7 pb-10 shadow-2xl flex-1 justify-between">
            <View>
              {/* Header Title */}
              <Text className="text-2xl font-extrabold text-gray-900">
                Verify Email
              </Text>
              <Text className="text-sm text-gray-500 mt-1 mb-1 leading-5">
                We've sent a 6-digit verification code to
              </Text>
              <Text className="text-sm font-bold text-indigo-600 mb-5">
                {email || "your email address"}
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

              {/* 6-Digit Visual Boxes */}
              <View className="flex-row justify-between mb-3">
                {[0, 1, 2, 3, 4, 5].map((index) => {
                  const digit = otp[index] || "";
                  const isFocused = otp.length === index;

                  return (
                    <View
                      key={index}
                      className={`w-12 h-14 rounded-2xl border items-center justify-center bg-gray-50 ${
                        isFocused
                          ? "border-indigo-600 bg-white"
                          : digit
                          ? "border-gray-400 bg-white"
                          : "border-gray-200"
                      }`}
                    >
                      <Text className="text-2xl font-bold text-gray-900">
                        {digit}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Real hidden/overlaid TextInput receiving user input */}
              <TextInput
                value={otp}
                onChangeText={(text) => {
                  // Only allow digits and max 6 characters
                  const clean = text.replace(/[^0-9]/g, "").slice(0, 6);
                  setOtp(clean);
                }}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                className="opacity-0 h-2 absolute w-full"
              />

              <Text className="text-xs text-gray-400 text-center mb-6">
                Code expires in 5 minutes
              </Text>

              {/* Verify Button */}
              <TouchableOpacity
                onPress={onVerify}
                disabled={isLoading || otp.length !== 6}
                activeOpacity={0.85}
                className={`w-full py-4 rounded-2xl items-center justify-center shadow-lg ${
                  otp.length === 6 && !isLoading
                    ? "bg-indigo-600 shadow-indigo-200"
                    : "bg-indigo-300"
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white text-base font-bold tracking-wide">
                    Verify Code
                  </Text>
                )}
              </TouchableOpacity>

              {/* Resend Code Section */}
              <View className="flex-row items-center justify-center mt-6">
                <Text className="text-sm text-gray-500">
                  Didn't receive code?{" "}
                </Text>
                {resendCountdown > 0 ? (
                  <Text className="text-sm font-semibold text-gray-400">
                    Resend in {resendCountdown}s
                  </Text>
                ) : (
                  <TouchableOpacity onPress={onResend} disabled={isResending}>
                    <Text className="text-sm font-bold text-indigo-600">
                      {isResending ? "Sending..." : "Resend OTP"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Footer: Change Email Link */}
            <TouchableOpacity onPress={onChangeEmail} className="mt-8 self-center">
              <Text className="text-sm text-gray-500 font-medium">
                Wrong email?{" "}
                <Text className="text-indigo-600 font-bold">Change</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default VerifyOtpView;