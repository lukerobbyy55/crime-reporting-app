import React, { useContext, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password || !rePassword) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    if (password !== rePassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password, rePassword);
      Alert.alert("Success", "Account created! Please log in.");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Registration Failed", "Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the community today</Text>

          <TextInput
            placeholder="Username"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholderTextColor="#666"
          />

          <TextInput
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholderTextColor="#666"
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholderTextColor="#666"
          />

          <TextInput
            placeholder="Confirm Password"
            secureTextEntry
            value={rePassword}
            onChangeText={setRePassword}
            style={styles.input}
            placeholderTextColor="#666"
          />

          <TouchableOpacity
            onPress={handleRegister}
            style={styles.button}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Creating..." : "Sign Up"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkButton}>
            <Text style={styles.linkText}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#000",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  linkButton: {
    marginTop: 24,
    alignItems: "center",
  },
  linkText: {
    color: "#007BFF",
    fontSize: 14,
  },
});
