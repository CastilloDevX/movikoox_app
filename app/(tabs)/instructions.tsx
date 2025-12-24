import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { getInstrucciones } from "@/app/services/movikoox.api";

const { height } = Dimensions.get("window");

export default function InstructionsScreen() {
    const { destLat, destLon, destName } = useLocalSearchParams<{
        destLat: string;
        destLon: string;
        destName: string;
    }>();

    const [steps, setSteps] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [userLocation, setUserLocation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const mapRef = useRef<MapView>(null);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);

    useEffect(() => {
        loadInstructions();
        startLocationTracking();

        return () => {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }
        };
    }, []);

    useEffect(() => {
        if (currentStep && userLocation) {
            animateCameraToStep();
        }
    }, [currentStepIndex, currentStep]);

    const loadInstructions = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") return;

            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            setUserLocation(loc.coords);

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

    const startLocationTracking = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") return;

            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 10,
                },
                (location) => {
                    setUserLocation(location.coords);
                }
            );
        } catch (e) {
            console.error("Error tracking location:", e);
        }
    };

    const animateCameraToStep = () => {
        if (!mapRef.current || !currentStep || !userLocation) return;

        const isWalk = currentStep.type === "walk";

        let fromLat, fromLon, toLat, toLon;

        if (isWalk) {
            fromLat = currentStep.from_stop?.latitud || userLocation.latitude;
            fromLon = currentStep.from_stop?.longitud || userLocation.longitude;
            toLat = currentStep.to_stop?.latitud || Number(destLat);
            toLon = currentStep.to_stop?.longitud || Number(destLon);
        } else {
            fromLat = currentStep.from_stop.latitud;
            fromLon = currentStep.from_stop.longitud;
            toLat = currentStep.to_stop.latitud;
            toLon = currentStep.to_stop.longitud;
        }

        const centerLat = (fromLat + toLat) / 2;
        const centerLon = (fromLon + toLon) / 2;

        const latDelta = Math.max(Math.abs(fromLat - toLat) * 1.2, 0.002);
        const lonDelta = Math.max(Math.abs(fromLon - toLon) * 1.2, 0.002);

        mapRef.current.animateToRegion(
            {
                latitude: centerLat,
                longitude: centerLon,
                latitudeDelta: latDelta,
                longitudeDelta: lonDelta,
            },
            1000
        );
    };

    const paradas = useMemo(() => {
        return steps
            .flatMap(step => [step.from_stop, step.to_stop])
            .filter(Boolean)
            .filter(
                (p, index, self) =>
                    index === self.findIndex(x => x.id === p.id)
            );
    }, [steps]);

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const currentStep = steps[currentStepIndex];

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {userLocation && (
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={StyleSheet.absoluteFill}
                    initialRegion={{
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                >
                    {/* Usuario */}
                    <Marker
                        coordinate={{
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude,
                        }}
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={[styles.userMarker]}>
                            <View style={styles.userMarkerInner} />
                        </View>
                    </Marker>

                    {/* Paradas */}
                    {paradas.map(paradero => (
                        <Marker
                            key={paradero.id}
                            coordinate={{
                                latitude: paradero.latitud,
                                longitude: paradero.longitud,
                            }}
                            anchor={{ x: 0.5, y: 1 }}
                        >
                            <View style={[styles.busStopMarker]}>
                                <Image
                                    source={require("../../assets/bus_stop.png")}
                                    style={styles.busStopIcon}
                                />
                            </View>
                        </Marker>
                    ))}

                    {/* Punto 1 */}
                    {currentStep && (
                        <Marker
                            coordinate={{
                                latitude: currentStep.from_stop?.latitud || userLocation.latitude,
                                longitude: currentStep.from_stop?.longitud || userLocation.longitude,
                            }}
                            anchor={{ x: 0.40, y: 2 }}
                        >
                            <View style={styles.highlightMarker}>
                                <Text style={styles.highlightText}>1</Text>
                            </View>
                        </Marker>
                    )}


                    {/* Punto 2 */}
                    {currentStep && (
                        <Marker
                            coordinate={{
                                latitude: currentStep.to_stop?.latitud || Number(destLat),
                                longitude: currentStep.to_stop?.longitud || Number(destLon),
                            }}
                            anchor={{ x: 0.45, y: 2 }}
                        >
                            <View style={styles.highlightMarker}>
                                <Text style={styles.highlightText}>2</Text>
                            </View>
                        </Marker>
                    )}


                    {/* Destino final */}
                    <Marker
                        coordinate={{
                            latitude: Number(destLat),
                            longitude: Number(destLon),
                        }}
                    />
                </MapView>
            )}

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Destino</Text>
                <Text style={styles.destination}>{destName}</Text>

                {summary && (
                    <View style={styles.summaryCard}>
                        <SummaryItem label="Tiempo" value={`${Math.round(summary.total_minutes)} min`} />
                        <SummaryItem label="Camiones" value={summary.num_buses} />
                        <SummaryItem label="Caminata" value={`${Math.round(summary.walk_minutes)} min`} />
                    </View>
                )}
            </View>

            {/* Bottom Sheet */}
            <View style={styles.bottomSheet}>
                <View style={styles.stepIndicator}>
                    <Text style={styles.stepIndicatorText}>
                        Paso {currentStepIndex + 1} de {steps.length}
                    </Text>
                </View>

                {loading ? (
                    <ActivityIndicator />
                ) : (
                    <>
                        <View style={styles.stepContainer}>
                            {currentStep && (
                                <InstructionStep step={currentStep} index={currentStepIndex} />
                            )}
                        </View>

                        <View style={styles.navigationButtons}>
                            <TouchableOpacity
                                style={[styles.navButton, currentStepIndex === 0 && styles.navButtonDisabled]}
                                onPress={handlePrevious}
                                disabled={currentStepIndex === 0}
                            >
                                <Text style={[styles.navButtonText, currentStepIndex === 0 && styles.navButtonTextDisabled]}>
                                    Atrás
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.navButton, currentStepIndex === steps.length - 1 && styles.navButtonDisabled]}
                                onPress={handleNext}
                                disabled={currentStepIndex === steps.length - 1}
                            >
                                <Text style={[styles.navButtonText, currentStepIndex === steps.length - 1 && styles.navButtonTextDisabled]}>
                                    Siguiente
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}

/* COMPONENTES */
function SummaryItem({ label, value }: any) {
    return (
        <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{value}</Text>
            <Text style={styles.summaryLabel}>{label}</Text>
        </View>
    );
}

function InstructionStep({ step, index }: any) {
    const isWalk = step.type === "walk";

    return (
        <View style={styles.stepCard}>
            <View>
                <Text style={styles.stepTitle}>{isWalk ? "Camina" : "Toma el camión"}</Text>

                {isWalk ? (
                    <>
                        <Text style={styles.stepLine}>Desde <Text style={styles.bold}>{step.from_stop?.nombre || "tu ubicación"}</Text></Text>
                        <Text style={styles.stepLine}>Hasta <Text style={styles.bold}>{step.to_stop?.nombre || "tu destino"}</Text></Text>
                    </>
                ) : (
                    <>
                        <Text style={styles.busName}>{step.bus}</Text>
                        <Text style={styles.stepLine}>En la parada <Text style={styles.bold}>{step.from_stop.nombre}</Text></Text>
                        <Text style={styles.stepLine}>Bájate en <Text style={styles.bold}>{step.to_stop.nombre}</Text></Text>
                    </>
                )}

                <Text style={styles.stepMeta}>
                    ⏱️ {Math.round(step.minutes)} min · 📍 {Math.round(step.distance_km * 1000)} m
                </Text>
            </View>
        </View>
    );
}

/* STYLES */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#7A1F33",
    },
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
    busStopMarker: {
        backgroundColor: "#8D2C47",
        padding: 6,
        borderRadius: 18,
        elevation: 4,
    },
    busStopIcon: {
        width: 25,
        height: 25,
    },
    highlightMarker: {
        width: 30,
        height: 30,
        borderRadius: 18,
        backgroundColor: "#8D2C47",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#fff",
    },
    highlightText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    header: {
        position: "absolute",
        top: 50,
        left: 20,
        right: 20,
        backgroundColor: "#fff",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 18,
        elevation: 8,
    },
    title: {
        fontSize: 13,
        color: "#777",
    },
    destination: {
        fontSize: 18,
        fontWeight: "700",
    },
    summaryCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    summaryItem: {
        alignItems: "center",
    },
    summaryValue: {
        fontWeight: "700",
        color: "#8D2C47",
    },
    summaryLabel: {
        fontSize: 11,
        color: "#666",
    },
    bottomSheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        padding: 16,
        paddingBottom: 40,
    },
    stepIndicator: {
        alignItems: "center",
    },
    stepIndicatorText: {
        backgroundColor: "#8D2C47",
        fontSize: 14,
        color: "#fff",
        fontWeight: "600",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 6,
        marginBottom: 10,
    },
    stepContainer: {
        flex: 1,
        justifyContent: "center",
        marginBottom: 12,
    },
    stepCard: {
        padding: 16,
        backgroundColor: "#f9f9f9",
        borderRadius: 16,
    },
    stepTitle: {
        fontWeight: "600",
        fontSize: 18,
        marginBottom: 8,
    },
    stepLine: {
        color: "#444",
        fontSize: 15,
        marginBottom: 4,
    },
    stepMeta: {
        fontSize: 13,
        color: "#777",
        marginTop: 8,
    },
    bold: {
        fontWeight: "700",
    },
    busName: {
        color: "#8D2C47",
        fontWeight: "600",
        fontSize: 17,
        marginBottom: 6,
    },
    navigationButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 10,
    },
    navButton: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        backgroundColor: "#8D2C47",
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
    },
    navButtonDisabled: {
        backgroundColor: "#d3d3d3",
    },
    navButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    navButtonTextDisabled: {
        color: "#999",
    },
});
