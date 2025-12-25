import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";

import { Parada } from "@/app/models/parada.model";

const { height } = Dimensions.get("window");

export default function RutaMapScreen() {
  const { busName, paradas } = useLocalSearchParams<{
    busName: string;
    paradas: string;
  }>();

  const mapRef = useRef<MapView>(null);
  const markerRefs = useRef<(Marker | null)[]>([]);

  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);

  /* ===========================
     PARADAS DESERIALIZADAS
  =========================== */
  const parsedParadas: Parada[] = useMemo(() => {
    try {
      if (!paradas) return [];
      const raw = JSON.parse(paradas);
      return raw.map((p: any) => ({
        ...p,
        latitud: Number(p.latitud),
        longitud: Number(p.longitud),
      }));
    } catch {
      return [];
    }
  }, [paradas]);

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
        (loc) => {
          setLocation(loc);
          setLoading(false);
        }
      );
    };

    startTracking();
    return () => subscription?.remove();
  }, []);

  /* ===========================
     REGIÓN INICIAL
  =========================== */
  const initialRegion =
    parsedParadas.length > 0
      ? {
          latitude: parsedParadas[0].latitud,
          longitude: parsedParadas[0].longitud,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }
      : {
          latitude: 19.84,
          longitude: -90.53,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        };

  /* ===========================
     FOCUS A PARADA + TOOLTIP
  =========================== */
  const focusParada = (parada: Parada, index: number) => {
    setSelectedIndex(index);

    mapRef.current?.animateToRegion(
      {
        latitude: parada.latitud,
        longitude: parada.longitud,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      },
      450
    );

    setTimeout(() => {
      markerRefs.current[index]?.showCallout();
    }, 300);
  };

  /* ===========================
     FOCUS USUARIO
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

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#7A1F33" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ================= MAPA ================= */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        showsUserLocation={false}
      >
        {/* === USUARIO === */}
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

        {/* === PARADAS === */}
        {parsedParadas.map((p, index) => (
          <Marker
            key={`stop-${index}`}
            ref={(ref) => (markerRefs.current[index] = ref)}
            coordinate={{
              latitude: p.latitud,
              longitude: p.longitud,
            }}
            onPress={() => focusParada(p, index)}
          >
            <View style={styles.busMarker}>
              <Image
                source={require("../../assets/bus_stop.png")}
                style={styles.busMarkerIcon}
              />
            </View>

            <Callout tooltip>
              <View style={styles.callout}>
                <Text style={styles.calloutText}>
                  {p.nombre}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* ================= HEADER ================= */}
      <View style={styles.topCard}>
        <Image
          source={require("../../assets/kooxbus_icon.png")}
          style={styles.busIcon}
        />
        <View>
          <Text style={styles.topTitle}>Ruta</Text>
          <Text style={styles.topBusName}>{busName}</Text>
        </View>
      </View>

      {/* ================= BOTÓN UBICACIÓN ================= */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={focusUser}
      >
        <Image
          source={require("../../assets/location.png")}
          style={styles.locationIcon}
        />
      </TouchableOpacity>

      {/* ================= BOTTOM SHEET ================= */}
      <View style={styles.bottomSheet}>
        {selectedIndex !== null && (
          <View style={styles.selectedStop}>
            <Text style={styles.selectedLabel}>
              Parada seleccionada
            </Text>
            <Text style={styles.selectedName}>
              {parsedParadas[selectedIndex].nombre}
            </Text>
          </View>
        )}

        <FlatList
          data={parsedParadas}
          keyExtractor={(_, index) => `list-${index}`}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.stopRow,
                selectedIndex === index && styles.stopRowActive,
              ]}
              onPress={() => focusParada(item, index)}
            >
              <View style={styles.stopIndex}>
                <Text style={styles.stopIndexText}>
                  {index + 1}
                </Text>
              </View>

              <Text style={styles.stopName}>
                {item.nombre}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

/* ===========================
   STYLES (SIN CAMBIOS VISUALES)
=========================== */

const styles = StyleSheet.create({
  container: { flex: 1 },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  topCard: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: "#8D2C47",
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    elevation: 8,
  },

  busIcon: { width: 44, height: 44, marginRight: 12 },
  topTitle: { color: "#fff", fontSize: 13 },
  topBusName: { color: "#fff", fontSize: 18, fontWeight: "700" },

  userMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4A90E2",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 6,
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

  busMarker: {
    backgroundColor: "#7A1F33",
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#fff",
  },

  busMarkerIcon: { width: 22, height: 22 },

  callout: {
    backgroundColor: "#7A1F33",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  calloutText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  locationButton: {
    position: "absolute",
    bottom: height * 0.38,
    right: 16,
    backgroundColor: "#7A1F33",
    padding: 12,
    borderRadius: 14,
    elevation: 6,
  },

  locationIcon: {
    width: 22,
    height: 22,
    tintColor: "#fff",
  },

  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 16,
    paddingBottom: 50,
  },

  selectedStop: { marginBottom: 12 },
  selectedLabel: { fontSize: 12, color: "#888" },
  selectedName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },

  stopRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  stopRowActive: { backgroundColor: "#f5f5f5" },

  stopIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#7A1F33",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  stopIndexText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  stopName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
});
