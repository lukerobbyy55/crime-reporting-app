import React, { createContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext(null);

const TOKEN_KEY = "crimeapp_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token on app start
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(TOKEN_KEY);
        if (saved) setToken(saved);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const auth = useMemo(
    () => ({
      token,
      isLoading,

      // TEMP login (until backend endpoints are ready)
      login: async (email, password) => {
        // Later: call backend, get JWT, store it.
        const fakeToken = `fake-token:${email}`;
        await AsyncStorage.setItem(TOKEN_KEY, fakeToken);
        setToken(fakeToken);
      },

      // TEMP register (until backend endpoints are ready)
      register: async (email, password) => {
        // Later: call backend register then login
        const fakeToken = `fake-token:${email}`;
        await AsyncStorage.setItem(TOKEN_KEY, fakeToken);
        setToken(fakeToken);
      },

      logout: async () => {
        await AsyncStorage.removeItem(TOKEN_KEY);
        setToken(null);
      },
    }),
    [token, isLoading]
  );

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
