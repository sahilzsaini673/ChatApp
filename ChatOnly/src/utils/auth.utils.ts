import * as SecureStore from "expo-secure-store";
import API_BASE_URL from "@/config/api";

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;

    const decodedJson = atob(payload);
    const decoded = JSON.parse(decodedJson);

    return decoded.exp * 1000 < Date.now() + 30000;
  } catch (error) {
    return true;
  }
}

export async function checkAuthStatus(): Promise<boolean> {
  try {
    const accessToken = await SecureStore.getItemAsync("ACCESS_TOKEN_KEY");
    const refreshToken = await SecureStore.getItemAsync("REFRESH_TOKEN_KEY");

    if (!accessToken || !refreshToken) {
      return false;
    }

    if(!isTokenExpired(accessToken)) return true;

    const response = await fetch(`${API_BASE_URL}/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (response.ok && data.success && data.tokens) {
      SecureStore.setItemAsync("ACCESS_TOKEN_KEY", data.tokens.accessToken);
      await SecureStore.setItemAsync(
        "REFRESH_TOKEN_KEY",
        data.tokens.refreshToken,
      );
      return true;
    }

    await SecureStore.deleteItemAsync("ACCESS_TOKEN_KEY");
    await SecureStore.deleteItemAsync("REFRESH_TOKEN_KEY");
    return false;
  } catch (error) {
    console.log("Auth check error:", error);
    return false;
  }
}