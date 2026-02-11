import React, { useContext, useMemo, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ScrollView 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LocationContext } from "../context/LocationContext";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

// Match Django choices
const CRIME_TYPES = [
  "theft",
  "assault",
  "burglary",
  "vandalism",
  "fraud",
  "other",
];

export default function ReportScreen({ navigation }) {
  const { coords, isLocLoading } = useContext(LocationContext);
  const { API_URL, token } = useContext(AuthContext);

  const [crimeType, setCrimeType] = useState("");
  const [otherCrimeType, setOtherCrimeType] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const coordsText = useMemo(() => {
    if (!coords) return "No GPS yet";
    return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  }, [coords]);

  const submitReport = async () => {
    if (!crimeType) {
      Alert.alert("Missing information", "Please select a crime type.");
      return;
    }
    if (crimeType === "other" && !otherCrimeType.trim()) {
      Alert.alert("Missing information", "Please specify the crime type.");
      return;
    }
    if (!description.trim() || description.length < 10) {
      Alert.alert("Description too short", "Description must be at least 10 characters.");
      return;
    }
    if (!coords) {
      Alert.alert("No Location", "Please wait for GPS location.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        crime_type: crimeType,
        crime_type_other: crimeType === "other" ? otherCrimeType : "",
        description,
        lat: coords.latitude,
        lon: coords.longitude,
        // occurred_at defaults to now in backend if omitted, or we can send it.
      };

      await axios.post(`${API_URL}/crime-reports/`, payload, {
        headers: { Authorization: `Token ${token}` },
      });

      Alert.alert("Success", "Report submitted successfully!");
      setCrimeType("");
      setOtherCrimeType("");
      setDescription("");
      navigation.navigate("Map");
    } catch (error) {
      console.error("Submit error:", error.response?.data || error.message);
      const msg = error.response?.data?.detail || "Failed to submit report. Please try again.";
      Alert.alert("Error", JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>New Report</Text>

        <Text style={styles.label}>Crime Type</Text>
        <View style={styles.chipsContainer}>
          {CRIME_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setCrimeType(type)}
              style={[
                styles.chip,
                crimeType === type && styles.chipSelected,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  crimeType === type && styles.chipTextSelected,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {crimeType === "other" && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.label}>Specify Other Type</Text>
            <TextInput
              value={otherCrimeType}
              onChangeText={setOtherCrimeType}
              placeholder="e.g. Arson"
              style={styles.input}
            />
          </View>
        )}

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe what happened..."
          multiline
          numberOfLines={4}
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
        />
        <Text style={styles.hint}>Min 10 characters.</Text>

        <Text style={styles.label}>Location</Text>
        <TextInput
          value={coordsText}
          editable={false}
          style={[styles.input, { backgroundColor: "#eee", color: "#666" }]}
        />

        <TouchableOpacity
          onPress={submitReport}
          style={[styles.button, submitting && { opacity: 0.7 }]}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Submitting..." : "Submit Report"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  chipSelected: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  chipText: {
    color: "#000",
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: "#E50000", // "Snapchat" red/alert color
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 32,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
  },
});

