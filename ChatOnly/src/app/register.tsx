import React, { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import RegisterView from "../components/auth/RegisterView";
import API_BASE_URL from "@/config/api";

export default function RegisterScreen() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [errorMessage, setErrormessage] = useState<string | null>(null);

    const handleRegister = async () => {
        setErrormessage(null);

        if (!name.trim()) {
            setErrormessage("Please enter your name");
            return;
        }

        if (!email.trim() || !email.includes("@")) {
            setErrormessage("Please enter a valid email address");
            return;
        }

        if (password.length < 12) {
            setErrormessage("Password must be at least 12 characters long");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    password ,
                }),
            });

            const data = await response.json();

            if (data.success) {
                router.push({
                    pathname: "/verify-otp" as any,
                    params: { email: email.trim().toLowerCase() },
                });
            } else {
                const errorMSG = data.message || "Registration failed";
                setErrormessage(errorMSG);
            }
        } catch (error) {
            setErrormessage(
                "Please check your connection."
            );
        } finally {
            setLoading(false);
        }
    }

    const handleGooglePress = () => {
        Alert.alert("Google sign in");
    }

    const handleLoginPress = () => {
        router.push("/login" as any);
    }

    return (
        <RegisterView 
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onSubmit={handleRegister}
            onGooglePress={handleGooglePress}
            onLoginPress={handleLoginPress}
        />
    );
}