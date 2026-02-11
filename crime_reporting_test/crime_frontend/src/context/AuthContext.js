import React, { createContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

export const AuthContext = createContext(null);

const TOKEN_KEY = "crimeapp_token";

// Replace with your computer's local IP address (find using ipconfig/ifconfig)
// This is required for physical devices to connect to the backend
const LOCAL_IP = "192.168.1.10"; 

// NOTE: the Django project exposes the child endpoints under `/api/` (see
// crime_backend/urls.py). Use `/api` here so requests go to e.g.:
// http://192.168.1.10:8000/api/register/
export const API_URL = `http://${LOCAL_IP}:8000/api`;

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
      API_URL,

      login: async (username, password) => {
        try {
          const url = `${API_URL}/login/`;
          console.log("Auth login URL ->", url);
          const response = await axios.post(url, {
            username,
            password,
          });
          const { token: newToken } = response.data;
          await AsyncStorage.setItem(TOKEN_KEY, newToken);
          setToken(newToken);
        } catch (error) {
          console.error("Login error:", error.response?.data || error.message);
          throw error;
        }
      },

      register: async (username, email, password, REpassword) => {
        try {
          const url = `${API_URL}/register/`;
          console.log("Auth register URL ->", url);
          await axios.post(url, {
            username,
            email,
            password,
            REpassword,
          });
          // Automatically login after register, or ask user to login.
          // For now, let's just return to allow caller to redirect to login or auto-login.
        } catch (error) {
          console.error("Register error:", error.response?.data || error.message);
          throw error;
        }
      },

      logout: async () => {
        try {
          // Optional: Call backend logout
           await axios.post(
             `${API_URL}/logout/`, 
             {}, 
             { headers: { Authorization: `Token ${token}` } }
           );
        } catch (e) {
          // ignore logout error
        }
        await AsyncStorage.removeItem(TOKEN_KEY);
        setToken(null);
      },
    }),
    [token, isLoading]
  );


  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
