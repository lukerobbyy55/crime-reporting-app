import React, { createContext, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";

export const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [coords, setCoords] = useState(null);
  const [isLocLoading, setIsLocLoading] = useState(true);
  const [locError, setLocError] = useState(null);

  const requestAndFetch = async () => {
    try {
      setIsLocLoading(true);
      setLocError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocError("Location permission denied.");
        Alert.alert(
          "Permission needed",
          "We need location access to show your position and report crimes accurately."
        );
        return;
      }

      // Fast attempt
      const last = await Location.getLastKnownPositionAsync();
      if (last?.coords) {
        setCoords({
          latitude: last.coords.latitude,
          longitude: last.coords.longitude,
        });
        return;
      }

      // Accurate attempt
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCoords({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (err) {
      setLocError(
        "Could not get location. If you're using an emulator, set a location in Android Studio → Extended controls → Location."
      );
    } finally {
      setIsLocLoading(false);
    }
  };

  useEffect(() => {
    requestAndFetch();
  }, []);

  const value = useMemo(
    () => ({
      coords,
      isLocLoading,
      locError,
      refreshLocation: requestAndFetch,
      setCoords, // optional, can remove later
    }),
    [coords, isLocLoading, locError]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}
