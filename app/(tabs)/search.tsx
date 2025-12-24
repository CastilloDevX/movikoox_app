import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { LocationResult } from "@/app/models/location.model";
import { searchLocationCampeche } from "@/app/services/geocoding.api";

export default function SearchScreen() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);

  /* ===========================
     EJECUTAR BÚSQUEDA (ENTER)
  =========================== */
  const handleSubmit = async () => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      const res = await searchLocationCampeche(query);
      setResults(res);
    } catch (error) {
      console.error("Error buscando ubicación", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscar destino</Text>

      <TextInput
        style={styles.input}
        placeholder="Ej. Hospital, parque, escuela ..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
        autoFocus
      />

      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

      <FlatList
        data={results}
        keyExtractor={(item, index) =>
          `${item.lat}-${item.lon}-${index}`
        }
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => {
              router.push({
                pathname: "/instructions",
                params: {
                  destLat: item.lat,
                  destLon: item.lon,
                  destName: item.nombre,
                },
              });
            }}
          >
            
            {/* NOMBRE */}
            <Text style={styles.resultTitle}>
              {item.nombre}
            </Text>

            {/* DIRECCIÓN */}
            <Text style={styles.resultSubtitle}>
              {item.direccionCompleta
                .split(",")
                .slice(0, 2)
                .join(",")}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading && query.length >= 3 ? (
            <Text style={styles.emptyText}>
              No se encontraron resultados
            </Text>
          ) : null
        }
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
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 14,
  },

  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 14,
  },

  resultItem: {
    paddingVertical: 14,
    borderBottomColor: "#8f8f8fff",
    backgroundColor: "#eeeeeeff",
    padding: 20
  },

  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2b2b2b",
  },

  resultSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#777",
  },

  emptyText: {
    marginTop: 20,
    textAlign: "center",
    color: "#777",
  },
});
