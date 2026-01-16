import React, { useContext, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { LocationContext } from "../context/LocationContext";

const CRIME_TYPES = [
  "Theft",
  "Assault",
  "Burglary",
  "Robbery",
  "Vandalism",
  "Harassment",
  "Other",
];

const MAX_DESCRIPTION_LENGTH = 300;

export default function ReportScreen({ navigation }) {
  const { coords, isLocLoading, locError, refreshLocation } =
    useContext(LocationContext);

  const [crimeType, setCrimeType] = useState("");
  const [otherCrimeType, setOtherCrimeType] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const coordsText = useMemo(() => {
    if (!coords) return "No GPS yet";
    return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  }, [coords]);

  const isCrimeTypeMissing = crimeType.trim() === "";

  const isOtherMissing =
    crimeType === "Other" && otherCrimeType.trim() === "";

  const isDescriptionTooLong =
    description.length > MAX_DESCRIPTION_LENGTH;

  const isFormInvalid =
    isCrimeTypeMissing || isOtherMissing || isDescriptionTooLong || !coords;

  const submitReport = async () => {
    if (isCrimeTypeMissing) {
      Alert.alert("Missing information", "Please select a crime type.");
      return;
    }

    if (crimeType === "Other" && isOtherMissing) {
      Alert.alert(
        "Missing information",
        "Please specify the crime type when selecting 'Other'."
      );
      return;
    }

    if (!coords) {
      Alert.alert(
        "No location",
        locError ||
          "We couldn't get your location. Try refreshing GPS."
      );
      return;
    }

    if (isDescriptionTooLong) {
      Alert.alert(
        "Description too long",
        `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`
      );
      return;
    }

    const finalCrimeType =
      crimeType === "Other"
        ? otherCrimeType.trim()
        : crimeType.trim();

    const payload = {
      crime_type: finalCrimeType,
      description: description.trim() || null,
      lat: coords.latitude,
      lng: coords.longitude,
      created_at: new Date().toISOString(),
    };

    try {
      setSubmitting(true);

      console.log("REPORT PAYLOAD:", payload);

      Alert.alert("Report submitted ✅", "Your report has been recorded.");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", "Could not submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: "700" }}>Report Crime</Text>

      {/* Quick crime types */}
      <Text style={{ fontWeight: "700" }}>Crime type *</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {CRIME_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => {
              setCrimeType(t);
              if (t !== "Other") setOtherCrimeType("");
            }}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: crimeType === t ? "black" : "#ddd",
              backgroundColor: crimeType === t ? "black" : "white",
            }}
          >
            <Text style={{ color: crimeType === t ? "white" : "black" }}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isCrimeTypeMissing && (
        <Text style={{ color: "#b00020" }}>
          Crime type is required.
        </Text>
      )}

      {crimeType === "Other" && (
        <>
          <Text style={{ fontWeight: "700" }}>
            Specify crime type *
          </Text>
          <TextInput
            placeholder="Enter crime type"
            value={otherCrimeType}
            onChangeText={setOtherCrimeType}
            style={{
              borderWidth: 1,
              borderColor: isOtherMissing ? "#b00020" : "#ccc",
              borderRadius: 10,
              padding: 12,
            }}
          />
          {isOtherMissing && (
            <Text style={{ color: "#b00020" }}>
              Please specify the crime type.
            </Text>
          )}
        </>
      )}

      <Text style={{ fontWeight: "700" }}>
        Description (optional)
      </Text>
      <TextInput
        placeholder="What happened?"
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={MAX_DESCRIPTION_LENGTH + 20}
        style={{
          borderWidth: 1,
          borderColor: isDescriptionTooLong ? "#b00020" : "#ccc",
          borderRadius: 10,
          padding: 12,
          height: 120,
          textAlignVertical: "top",
        }}
      />
      <Text
        style={{
          alignSelf: "flex-end",
          color: isDescriptionTooLong ? "#b00020" : "#666",
        }}
      >
        {description.length}/{MAX_DESCRIPTION_LENGTH}
      </Text>

      <View
        style={{
          padding: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#ddd",
          backgroundColor: "#fafafa",
          gap: 6,
        }}
      >
        <Text style={{ fontWeight: "700" }}>Current location</Text>
        <Text>{isLocLoading ? "Getting GPS…" : coordsText}</Text>
        {locError && (
          <Text style={{ color: "#b00020" }}>{locError}</Text>
        )}

        <TouchableOpacity
          onPress={refreshLocation}
          style={{
            marginTop: 6,
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#ddd",
            backgroundColor: "white",
          }}
        >
          <Text style={{ fontWeight: "700" }}>Refresh GPS</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={submitReport}
        disabled={isFormInvalid || submitting}
        style={{
          backgroundColor:
            isFormInvalid || submitting ? "#999" : "black",
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>
          {submitting ? "Submitting…" : "Submit report"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
