import React, { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import API_BASE_URL from "@/config/api";
import * as SecureStore from "expo-secure-store";
import LoginView from "@/components/auth/loginView";
import { registerForPushNotification } from "@/utils/notification.utils";

export default function LoginScreen() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleLogin = async () => {
        setErrorMessage(null);

        if (!email.trim() || !email.includes("@")) {
            setErrorMessage("Please enter a valid email address");
            return;
        }

        if (!password) {
            setErrorMessage("Please enter the password");
            return;
        }

        setIsLoading(true);

        try {
            const repsonse = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                }),
            });

            const data = await repsonse.json();

            if (data.success) {
                await SecureStore.setItemAsync("ACCESS_TOKEN_KEY", data.tokens.accessToken);
                await SecureStore.setItemAsync("REFRESH_TOKEN_KEY", data.tokens.refreshToken);
                await SecureStore.setItemAsync("CURRENT_USER_ID", data.user.id);
                await registerForPushNotification();
                router.replace("/(tabs)" as any);
            } else {
                setErrorMessage(data.message);
                if (data.isVerified === false) {
                    Alert.alert("Email Not Verified", data.message, [
                        {
                            text: "Verify Now",
                            onPress: () =>
                                router.push({
                                    pathname: "/verify-otp" as any,
                                    params: { email: email.trim().toLowerCase() },
                                }),
                        },
                    ]);
                    return;
                }
            }
        } catch (error) {
            console.error("error", error);
            setErrorMessage("Please check your connnection.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleGooglePress = () => {
        router.push("/register" as any);
    }

    const handleForgotPassword = () => {
        router.push("/forget-password" as any);
    }

    const handleRegisterPress = () => {
        router.push("/register");
    }

    return (
        <LoginView
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onSubmit={handleLogin}
            onGooglePress={handleGooglePress}
            onRegisterPress={handleRegisterPress}
            onForgotPassword={handleForgotPassword}
        />
    )
}