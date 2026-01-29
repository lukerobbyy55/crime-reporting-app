import React, { useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { LocationContext } from "../context/LocationContext";

// Frontend mock data (replace with GET /reports)
const MOCK_REPORTS = [
  {
    id: "1",
    crime_type: "Theft",
    description: "Phone snatched near the shop entrance.",
    lat: 53.3498,
    lng: -6.2603,
    created_at: "2026-01-09T12:10:00.000Z",
  },
  {
    id: "2",
    crime_type: "Vandalism",
    description: "Graffiti on the wall beside the bus stop.",
    lat: 53.3479,
    lng: -6.2591,
    created_at: "2026-01-08T18:40:00.000Z",
  },
  {
    id: "3",
    crime_type: "Harassment",
    description: "Reported harassment outside a bar.",
    lat: 53.3466,
    lng: -6.2582,
    created_at: "2026-01-07T22:30:00.000Z",
  },
];

function timeAgo(iso) {
  if (!iso) return "";
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMins = Math.max(0, Math.round((now - then) / 60000));

  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

export default function MapScreen({ navigation }) {
  const { coords, isLocLoading, locError, refreshLocation } =
    useContext(LocationContext);

  const [selectedReport, setSelectedReport] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const region = useMemo(() => {
    if (!coords) return null;
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  }, [coords]);

  const openSheet = (report) => {
    setSelectedReport(report);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setSelectedReport(null);
  };

  if (isLocLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Getting your location…</Text>
      </View>
    );
  }

  if (!coords) {
    return (
      <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "700" }}>Map</Text>
        <Text>
          {locError ||
            "No coordinates available. If you're using an emulator, set a location in Android Studio → Extended controls → Location."}
        </Text>

        <TouchableOpacity
          onPress={refreshLocation}
          style={{
            backgroundColor: "black",
            padding: 14,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Try again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Settings")}
          style={{
            backgroundColor: "#eee",
            padding: 14,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "600" }}>Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} initialRegion={region} showsUserLocation>
        {/* Mock pins */}
        {MOCK_REPORTS.map((r) => (
          <Marker
            key={r.id}
            coordinate={{ latitude: r.lat, longitude: r.lng }}
            title={r.crime_type}
            description={r.description}
            onPress={() => openSheet(r)}
          />
        ))}
      </MapView>

      <View
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          gap: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("Report")}
          style={{
            backgroundColor: "black",
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>
            Report a crime
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            onPress={refreshLocation}
            style={{
              flex: 1,
              backgroundColor: "#fffff",
              padding: 12,
              borderRadius: 12,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#ddd",
              backgroundColor: "white",
            }}
          >
            <Text style={{ fontWeight: "700" }}>Refresh GPS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Settings")}
            style={{
              flex: 1,
              backgroundColor: "white",
              padding: 12,
              borderRadius: 12,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Text style={{ fontWeight: "700" }}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={sheetOpen}
        transparent
        animationType="slide"
        onRequestClose={closeSheet}
      >
        {/* Backdrop (tap to close) */}
        <Pressable
          onPress={closeSheet}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}
        />

        {/* Sheet */}
        <View
          style={{
            backgroundColor: "white",
            padding: 16,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            borderWidth: 1,
            borderColor: "#eee",
          }}
        >
          <View
            style={{
              alignSelf: "center",
              width: 48,
              height: 5,
              borderRadius: 999,
              backgroundColor: "#ddd",
              marginBottom: 10,
            }}
          />

          <Text style={{ fontSize: 22, fontWeight: "800" }}>
            {selectedReport?.crime_type || "Report"}
          </Text>

          {!!selectedReport?.created_at && (
            <Text style={{ color: "#666", marginTop: 4 }}>
              {timeAgo(selectedReport.created_at)}
            </Text>
          )}

          {!!selectedReport?.description && (
            <Text style={{ marginTop: 10, fontSize: 16 }}>
              {selectedReport.description}
            </Text>
          )}

          {!!selectedReport && (
            <Text style={{ marginTop: 10, color: "#666" }}>
              Location: {selectedReport.lat.toFixed(5)},{" "}
              {selectedReport.lng.toFixed(5)}
            </Text>
          )}

          <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
            <TouchableOpacity
              onPress={() => {
                closeSheet();
                navigation.navigate("Report");
              }}
              style={{
                flex: 1,
                backgroundColor: "black",
                padding: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "800" }}>
                Report near here
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={closeSheet}
              style={{
                flex: 1,
                backgroundColor: "#f2f2f2",
                padding: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "800" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
