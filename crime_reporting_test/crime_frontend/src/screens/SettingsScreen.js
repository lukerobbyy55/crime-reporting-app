import React, { useContext, useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

export default function SettingsScreen() {
  const { logout, API_URL, token } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(false);

  // Password Change State
  const [showPass, setShowPass] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [reNewPass, setReNewPass] = useState("");

  // Email Change State
  const [showEmail, setShowEmail] = useState(false);
  const [oldEmail, setOldEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [passwordForEmail, setPasswordForEmail] = useState("");

  const handleChangePassword = async () => {
    if (newPass !== reNewPass) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/change-password/`, 
        { old_password: oldPass, new_password: newPass, REnew_password: reNewPass },
        { headers: { Authorization: `Token ${token}` } }
      );
      Alert.alert("Success", "Password updated successfully");
      setShowPass(false);
      setOldPass(""); setNewPass(""); setReNewPass("");
    } catch (e) {
      Alert.alert("Error", "Failed to update password. Check old password.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/change-email/`,
        { old_email: oldEmail, new_email: newEmail, password: passwordForEmail },
        { headers: { Authorization: `Token ${token}` } }
      );
      Alert.alert("Success", "Email updated successfully");
      setShowEmail(false);
      setOldEmail(""); setNewEmail(""); setPasswordForEmail("");
    } catch (e) {
      Alert.alert("Error", "Failed to update email.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
             try {
               await axios.delete(`${API_URL}/delete-account/`, {
                 headers: { Authorization: `Token ${token}` }
               });
               logout(); // AuthContext cleans up
             } catch(e) {
               Alert.alert("Error", "Could not delete account.");
             }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Settings</Text>

        <Section title="Account Security">
          <TouchableOpacity 
            style={styles.row} 
            onPress={() => setShowPass(!showPass)}
          >
            <Text style={styles.rowText}>Change Password</Text>
          </TouchableOpacity>
          
          {showPass && (
            <View style={styles.formContainer}>
              <TextInput placeholder="Old Password" secureTextEntry style={styles.input} value={oldPass} onChangeText={setOldPass}/>
              <TextInput placeholder="New Password" secureTextEntry style={styles.input} value={newPass} onChangeText={setNewPass}/>
              <TextInput placeholder="Confirm New Password" secureTextEntry style={styles.input} value={reNewPass} onChangeText={setReNewPass}/>
              <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword}>
                 <Text style={styles.actionButtonText}>Update Password</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity 
            style={styles.row}
            onPress={() => setShowEmail(!showEmail)}
          >
            <Text style={styles.rowText}>Change Email</Text>
          </TouchableOpacity>

          {showEmail && (
            <View style={styles.formContainer}>
               <TextInput placeholder="Old Email" style={styles.input} value={oldEmail} onChangeText={setOldEmail}/>
               <TextInput placeholder="New Email" style={styles.input} value={newEmail} onChangeText={setNewEmail}/>
               <TextInput placeholder="Password" secureTextEntry style={styles.input} value={passwordForEmail} onChangeText={setPasswordForEmail}/>
               <TouchableOpacity style={styles.actionButton} onPress={handleChangeEmail}>
                 <Text style={styles.actionButtonText}>Update Email</Text>
              </TouchableOpacity>
            </View>
          )}
        </Section>

        <Section title="Danger Zone">
           <TouchableOpacity style={styles.logoutButton} onPress={logout}>
             <Text style={styles.logoutText}>Log Out</Text>
           </TouchableOpacity>

           <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
             <Text style={styles.deleteText}>Delete Account</Text>
           </TouchableOpacity>
        </Section>
        
        {loading && (
          <View style={styles.loadingOverlay}>
             <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f7",
  },
  scroll: {
    padding: 20,
  },
  header: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000",
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    padding: 16,
    paddingBottom: 8,
    backgroundColor: "#f2f2f7",
  },
  row: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rowText: {
    fontSize: 16,
    color: "#000",
  },
  formContainer: {
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  logoutButton: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  logoutText: {
    color: "#007BFF",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    padding: 16,
    alignItems: "center",
  },
  deleteText: {
    color: "#ff3b30",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
});

