import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import API_BASE_URL from "@/config/api";
import VerifyOtpView from "@/components/auth/verify-otp";

export default function VerifyOtpScreen() {
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email: string }>();

    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [resendCountdown, setResendCountdown] = useState(60);
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setInterval(() => {
                setResendCountdown((prev) => prev-1);
            }, 1000);
        return () => clearInterval(timer);
        }
    }, [resendCountdown]);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            setErrorMessage("Please enter the complete 6-digit code");
            return;
        }

        setErrorMessage(null);
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email || "",
                    otp,
                }),
            });

            const data = await response.json();

            if (data.success) {
                router.push({
                    pathname: "/change-password" as any,
                    params: { email: email.trim().toLowerCase() },
                });
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            setErrorMessage("Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleChangeEmail = () => {
        router.push("/register" as any);
    }

    const handleResend = () => {
        router.push("/register" as any);
    }

    return (
        <VerifyOtpView
            email={typeof email === "string" ? email : ""}
            otp={otp}
            setOtp={setOtp}
            isLoading={isLoading}
            errorMessage={errorMessage}
            resendCountdown={resendCountdown}
            isResending={isResending}
            onVerify={handleVerify}
            onResend={handleResend}
            onChangeEmail={handleChangeEmail}
        /> 
    );
}