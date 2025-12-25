import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

import { Parada } from "@/app/models/parada.model";
import { getParaderoCercano } from "@/app/services/movikoox.api";

export default function HomeScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);
  const [paradero, setParadero] = useState<Parada | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  /* ===========================
     UBICACIÓN EN TIEMPO REAL
  =========================== */
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 5,
        },
        async (loc) => {
          setLocation(loc);

          try {
            const res = await getParaderoCercano(
              loc.coords.latitude,
              loc.coords.longitude
            );

            setParadero(res.parada);
            setDistanceKm(res.distance_km);
          } catch (e) {
            console.log("Error paradero cercano", e);
          }

          setLoading(false);
        }
      );
    };

    startTracking();

    return () => {
      subscription?.remove();
    };
  }, []);

  /* ===========================
     RECENTRAR MAPA
  =========================== */
  const focusUser = () => {
    if (!location) return;

    mapRef.current?.animateToRegion(
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      },
      500
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ================= MAPA ================= */}
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={false}
        initialRegion={{
          latitude: 19.830211,
          longitude: -90.515757,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* === USUARIO (MISMO ICONO QUE INSTRUCTIONS) === */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}

        {/* === PARADERO MÁS CERCANO === */}
        {paradero && (
          <Marker
            coordinate={{
              latitude: paradero.latitud,
              longitude: paradero.longitud,
            }}
            title={paradero.nombre}
          >
            <View style={styles.busStopMarker}>
              <Image
                source={require("../../assets/bus_stop.png")}
                style={styles.busStopIcon}
              />
            </View>
          </Marker>
        )}
      </MapView>

      {/* ================= CARD SUPERIOR ================= */}
      <View style={styles.topCard}>
        <Image
          source={require("../../assets/kooxbus_icon.png")}
          style={styles.busIcon}
        />

        {loading ? (
          <ActivityIndicator />
        ) : paradero ? (
          <View>
            <Text style={styles.topTitle}>Paradero más cercano</Text>
            <Text style={styles.topSubtitle}>{paradero.nombre}</Text>

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

      {/* ================= BOTÓN BUSES ================= */}
      <TouchableOpacity
        style={styles.buses}
        onPress={() => router.push("/list_buses")}
      >
        <Image
          source={require("../../assets/bus_stop.png")}
          style={styles.buses_icon}
        />
      </TouchableOpacity>

      {/* ================= SEARCH CARD ================= */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchTitle}>
          ¿A dónde quieres ir?
        </Text>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => router.push("/search")}
        >
          <Text style={styles.searchButtonText}>
            Buscar destino
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={focusUser}
        >
          <Image
            source={require("../../assets/location.png")}
            style={styles.locationIcon}
          />
          <Text style={styles.currentLocationText}>
            Ubicación actual
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
    top: 50,
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

  topTitle: { fontSize: 12, color: "#777" },
  topSubtitle: { fontSize: 16, fontWeight: "600" },
  distanceText: { fontSize: 12, color: "#555" },

  /* === USER MARKER (IGUAL AL DE INSTRUCTIONS) === */
  userMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4A90E2",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 5,
  },

  userMarkerInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#2E5FA3",
    position: "absolute",
    top: 3,
    left: 3,
  },

  /* === BUS STOP === */
  busStopMarker: {
    width: 36,
    height: 36,
    borderRadius: 21,
    backgroundColor: "#7A1F33",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  busStopIcon: {
    width: 22,
    height: 22,
    tintColor: "#fff",
  },

  searchContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#7A1F33",
    padding: 25,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingBottom: 60,
  },

  searchTitle: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 14,
  },

  searchButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 14,
  },

  searchButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7A1F33",
  },

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

  buses: {
    position: "absolute",
    bottom: 250,
    right: 20,
    backgroundColor: "#7A1F33",
    padding: 10,
    borderRadius: 10,
  },

  buses_icon: {
    width: 40,
    height: 40,
  },
});
