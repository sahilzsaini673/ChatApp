import React, { useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ChangePasswordView from "@/components/auth/ChangePasswordView";
import API_BASE_URL from "@/config/api";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (password.length < 12) {
      setErrorMessage("Password must be at least 12 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/new-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: typeof email === "string" ? email.trim().toLowerCase() : "",
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert("Success", "Password changed successfully! Please log in with your new password.", [
          {
            text: "Go to Login",
            onPress: () => router.replace("/login" as any),
          },
        ]);
      } else {
        setErrorMessage(data.message || "Failed to update password. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Could not connect to the server. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace("/login" as any);
  };

  return (
    <ChangePasswordView
      password={password}
      setPassword={setPassword}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onSubmit={handleSubmit}
      onBackToLogin={handleBackToLogin}
    />
  );
}