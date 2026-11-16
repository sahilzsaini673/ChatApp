import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/register" as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white justify-between">
      {/* Center Section: 3D Illustration & Text */}
      <View className="flex-1 items-center px-6 py-6">
        <Image
          source={require("../../assets/images/chat-welcome.png")}
          className="rounded-3xl"
          style={{ width: 300, height: 380 }}
          contentFit="contain"
          transition={300}
        />

        <Text className="text-3xl font-extrabold text-gray-900 text-center mb-3">
          Stay Connected
        </Text>
        <Text className="text-base text-gray-500 text-center px-4 leading-6">
          Fast, simple, and secure real-time messaging with your friends anytime, anywhere.
        </Text>
      </View>

      {/* Bottom Full-Width Button */}
      <View className="w-full">
        <View className="pb-6 px-6">
          <TouchableOpacity
            onPress={handleGetStarted}
            activeOpacity={0.8}
            className="w-full bg-indigo-600 py-4 rounded-2xl items-center justify-center shadow-lg shadow-indigo-200"
          >
            <Text className="text-white text-lg font-semibold tracking-wide">
              Let's get started
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}