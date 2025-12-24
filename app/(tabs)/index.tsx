import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function HomeScreen() {
  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);

  const mapRef = useRef<MapView | null>(null);

  const fetchCurrentLocation = async () => {
    const { status } =
      await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    setLocation(loc);

    mapRef.current?.animateToRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  return (
    <View style={styles.container}>
      {/* MAPA */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 19.830211,
          longitude: -90.515757,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
          />
        )}
      </MapView>

      {/* CARD SUPERIOR */}
      <View style={styles.topCard}>
        <Image
          source={require("../../assets/kooxbus_icon.png")}
          style={styles.busIcon}
        />
        <View>
          <Text style={styles.topTitle}>Paradero más cercano</Text>
          <Text style={styles.topSubtitle}>Chihuahua</Text>
        </View>
      </View>

      {/* BUSCADOR */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchTitle}>¿A dónde quieres ir?</Text>

        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Buscar destino"
            placeholderTextColor="#888"
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={fetchCurrentLocation}
        >
          <Image
            source={require("../../assets/location.png")}
            style={styles.locationIcon}
          />
          <Text style={styles.currentLocationText}>
            Usar ubicación actual
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  /* ================= TOP CARD ================= */
  topCard: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 6,
  },

  busIcon: {
    width: 42,
    height: 42,
    marginRight: 10,
  },

  topTitle: {
    fontSize: 12,
    color: "#777",
  },

  topSubtitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  /* ================= SEARCH CARD ================= */
  searchContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#7A1F33",
    padding: 25,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },

  searchTitle: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 14,
  },

  inputWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    justifyContent: "center",
    marginBottom: 14,
  },

  input: {
    fontSize: 15,
  },

  /* ================= LOCATION BUTTON ================= */
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8F2B45",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  locationIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
    tintColor: "#fff",
  },

  currentLocationIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  currentLocationText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
});
