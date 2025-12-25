import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ruta } from "@/app/models/ruta.model";
import { getRutas } from "@/app/services/movikoox.api";

export default function BusesScreen() {
  const router = useRouter();
  const [rutas, setRutas] = useState<Ruta[]>([]);

  useEffect(() => {
    getRutas().then(setRutas);
  }, []);

  return (
    <View style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Camiones KO’OX</Text>
        <Text style={styles.headerSubtitle}>
          Selecciona una ruta para ver sus paradas
        </Text>
      </View>

      {/* ================= LISTA ================= */}
      <FlatList
        data={rutas}
        keyExtractor={(item, index) =>
          `${item.nombre}-${index}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: "/ruta_map",
                params: {
                  busName: item.nombre,
                  paradas: JSON.stringify(item.paradas),
                },
              })
            }
          >
            {/* ICONO */}
            <View style={styles.iconContainer}>
              <Image
                source={require("../../assets/kooxbus_icon.png")}
                style={styles.busIcon}
              />
            </View>

            {/* INFO */}
            <View style={styles.infoContainer}>
              <Text style={styles.busName}>
                {item.nombre}
              </Text>
              <Text style={styles.busSubtitle}>
                Ver recorrido y paradas
              </Text>
            </View>

            {/* CHEVRON */}
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

/* ===========================
   STYLES
=========================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7A1F33",
    paddingTop: 60,
  },

  /* HEADER */
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 4,
  },

  headerSubtitle: {
    color: "#F2D7DE",
    fontSize: 14,
  },

  /* LIST */
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  /* CARD */
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    elevation: 6,
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#ececec",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  busIcon: {
    width: 28,
    height: 28,
  },

  infoContainer: {
    flex: 1,
  },

  busName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 2,
  },

  busSubtitle: {
    fontSize: 13,
    color: "#777",
  },

  chevron: {
    fontSize: 26,
    color: "#bbb",
    marginLeft: 6,
  },
});
