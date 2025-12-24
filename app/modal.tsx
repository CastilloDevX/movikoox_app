import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Movikoox</Text>

      <Text style={styles.text}>
        Proyecto ciudadano para mejorar el acceso a la información del
        transporte público en Campeche.
      </Text>

      <Text style={styles.warning}>
        ⚠️ Esta aplicación NO es oficial y no tiene relación con el gobierno.
        Proyecto en fase BETA. ⚠️
      </Text>

      <Link href="/" dismissTo asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Entendido</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 16,
    color: "#7A1F33",
    textAlign: "center",
  },

  text: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },

  warning: {
    fontSize: 14,
    color: "#a00",
    textAlign: "center",
    marginBottom: 30,
  },

  button: {
    backgroundColor: "#7A1F33",
    paddingVertical: 14,
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
