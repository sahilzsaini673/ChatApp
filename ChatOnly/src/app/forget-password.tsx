import React, { useState } from "react";
import { useRouter } from "expo-router";
import API_BASE_URL from "@/config/api";
import ForgetPasswordView from "@/components/auth/ForgetPasswordView";
import { Alert } from "react-native";

export default function ForgetPasswordScreen() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async () => {
        setErrorMessage(null);

        if (!email) {
            setErrorMessage("Please enter the email");
        }

        setIsLoading(true);

        try {
            Alert.alert("Hello")
            const response = await fetch(`${API_BASE_URL}/forget-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                }),
            });

            const data = await response.json();

            if (data.success) {
                router.push({
                    pathname: "/verify-otp-for-password" as any,
                    params: { email: email.trim().toLowerCase() },
                });
            } else {
                setErrorMessage(data.message || "Failed to send OTP. Please check your email.");
            }
        } catch (error) {
            setErrorMessage("Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleBackToLogin = () => {
        router.push("/login" as any);
    };

    return (
        <ForgetPasswordView
            email={email}
            setEmail={setEmail}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onSubmit={handleSubmit}
            onBackToLogin={handleBackToLogin}
        />
    );

}