import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

import { Parada } from "@/app/models/parada.model";
import { getParaderoCercano } from "@/app/services/movikoox.api";

export default function HomeScreen() {
  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);
  const [paradero, setParadero] = useState<Parada | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /* ===========================
     OBTENER UBICACIÓN + PARADERO
  =========================== */
  const loadCurrentLocation = async () => {
    setLoading(true);

    const { status } =
      await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLoading(false);
      return;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    setLocation(loc);

    try {
      const res = await getParaderoCercano(
        loc.coords.latitude,
        loc.coords.longitude
      );

      setParadero(res.parada);
      setDistanceKm(res.distance_km);
    } catch (error) {
      console.error("Error obteniendo paradero cercano", error);
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     CARGA INICIAL
  =========================== */
  useEffect(() => {
    loadCurrentLocation();
  }, []);

  return (
    <View style={styles.container}>
      {/* MAPA */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude:
            location?.coords.latitude ?? 19.830211,
          longitude:
            location?.coords.longitude ?? -90.515757,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Tu ubicación"
          />
        )}

        {paradero && (
          <Marker
            coordinate={{
              latitude: paradero.latitud,
              longitude: paradero.longitud,
            }}
            title={paradero.nombre}
            description="Paradero más cercano"
          />
        )}
      </MapView>

      {/* CARD SUPERIOR */}
      <View style={styles.topCard}>
        <Image
          source={require("../../assets/kooxbus_icon.png")}
          style={styles.busIcon}
        />

        {loading ? (
          <ActivityIndicator />
        ) : paradero ? (
          <View>
            <Text style={styles.topTitle}>
              Paradero más cercano
            </Text>
            <Text style={styles.topSubtitle}>
              {paradero.nombre}
            </Text>

            {distanceKm !== null && (
              <Text style={styles.distanceText}>
                A {Math.round(distanceKm * 1000)} m
              </Text>
            )}
          </View>
        ) : (
          <Text>No se pudo obtener el paradero</Text>
        )}
      </View>

      {/* BUSCADOR */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchTitle}>
          ¿A dónde quieres ir?
        </Text>

        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Buscar destino"
            placeholderTextColor="#888"
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={loadCurrentLocation}
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

/* ===========================
   STYLES
=========================== */
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

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

  distanceText: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
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

  currentLocationText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
});
