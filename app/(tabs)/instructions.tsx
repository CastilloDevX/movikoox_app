import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { getInstrucciones } from "@/app/services/movikoox.api";

export default function InstructionsScreen() {
    const { destLat, destLon, destName } = useLocalSearchParams<{
        destLat: string;
        destLon: string;
        destName: string;
    }>();

    const [steps, setSteps] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInstructions();
    }, []);
    const loadInstructions = async () => {
        try {
            const { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") return;

            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const res = await getInstrucciones(
                loc.coords.latitude,
                loc.coords.longitude,
                Number(destLat),
                Number(destLon)
            );

            setSteps(res.instructions);
            setSummary(res.summary);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Destino</Text>
            <Text style={styles.destination}>{destName}</Text>

            {summary && (
                <View style={styles.summaryCard}>
                    <SummaryItem
                        label="Tiempo aprox."
                        value={`${Math.round(summary.total_minutes)} min`}
                    />
                    <SummaryItem
                        label="Camiones"
                        value={summary.num_buses}
                    />
                    <SummaryItem
                        label="Caminata"
                        value={`${Math.round(summary.walk_minutes)} min`}
                    />
                </View>
            )}

            {loading ? (
                <ActivityIndicator />
            ) : (
                <FlatList
                    data={steps}
                    keyExtractor={(_, i) => i.toString()}
                    renderItem={({ item, index }) => (
                        <InstructionStep step={item} index={index} />
                    )}
                />
            )}
        </View>
    );
}

function SummaryItem({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{value}</Text>
            <Text style={styles.summaryLabel}>{label}</Text>
        </View>
    );
}

function InstructionStep({
    step,
    index,
}: {
    step: any;
    index: number;
}) {
    const isWalk = step.type === "walk";

    return (
        <View style={styles.stepCard}>
            {/* CÍRCULO CON NÚMERO */}
            <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>
                    {index + 1}
                </Text>
            </View>

            {/* CONTENIDO */}
            <View style={styles.stepContent}>
                {/* TÍTULO */}
                <Text style={styles.stepTitle}>
                    {isWalk ? "Camina" : "Toma el camión"}
                </Text>

                {/* CONTENIDO WALK */}
                {isWalk && (
                    <>
                        <Text style={styles.stepLine}>
                            Desde{" "}
                            <Text style={styles.bold}>
                                {step.from_stop
                                    ? `la parada ${step.from_stop.nombre}`
                                    : "tu ubicación"}
                            </Text>
                        </Text>

                        <Text style={styles.stepLine}>
                            Hasta{" "}
                            <Text style={styles.bold}>
                                {step.to_stop
                                    ? `la parada ${step.to_stop.nombre}`
                                    : "tu destino"}
                            </Text>
                        </Text>
                    </>
                )}

                {/* CONTENIDO BUS */}
                {!isWalk && (
                    <>
                        <Text style={styles.busName}>
                            {step.bus}
                        </Text>

                        <Text style={styles.stepLine}>
                            En la parada{" "}
                            <Text style={styles.bold}>
                                {step.from_stop.nombre}
                            </Text>
                        </Text>

                        <Text style={styles.stepLine}>
                            Bájate en la parada{" "}
                            <Text style={styles.bold}>
                                {step.to_stop.nombre}
                            </Text>
                        </Text>
                    </>
                )}

                {/* META */}
                <Text style={styles.stepMeta}>
                    {Math.round(step.minutes)} min ·{" "}
                    {Math.round(step.distance_km * 1000)} m
                </Text>
            </View>

            {/* ICONO */}
            <Image
                source={
                    isWalk
                        ? require("../../assets/walk.png")
                        : require("../../assets/kooxbus_icon.png")
                }
                style={[
                    styles.stepIcon,
                    isWalk && { 
                        tintColor: "#9a9a9a", 
                        height: 60,
                        width: 60,
                    },
                ]}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },

    title: {
        fontSize: 14,
        color: "#777",
    },

    destination: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 12,
    },

    /* SUMMARY */
    summaryCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#f4f4f4",
        padding: 14,
        borderRadius: 14,
        marginBottom: 20,
    },

    summaryItem: {
        alignItems: "center",
    },

    summaryValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#8D2C47",
    },

    summaryLabel: {
        fontSize: 12,
        color: "#666",
    },

    /* STEPS */
    stepCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        backgroundColor: "#f9f9f9",
        borderRadius: 14,
        marginBottom: 12,
    },

    stepNumber: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#8D2C47",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    stepNumberText: {
        color: "#fff",
        fontWeight: "700",
    },

    stepContent: {
        flex: 1,
    },

    stepTitle: {
        fontSize: 15,
        fontWeight: "600",
    },

    stepSubtitle: {
        fontSize: 13,
        color: "#8D2C47",
    },

    stepMeta: {
        fontSize: 12,
        color: "#777",
        marginTop: 2,
    },

    stepIcon: {
        width: 75,
        height: 60,
    },

    stepLine: {
        fontSize: 14,
        color: "#444",
        marginTop: 2,
    },

    bold: {
        fontWeight: "600",
        color: "#000",
    },

    busName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#8D2C47",
        marginBottom: 2,
    },

});
