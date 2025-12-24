import { LocationResult } from "@/app/models/location.model";
import axios from "axios";

/* ===========================
   CONFIGURACIÓN
=========================== */

const API_KEY = "pk.4b1590fc44699aeb53ddccdc963b27d8";

// Bounding Box del Municipio de Campeche
// minLon, minLat, maxLon, maxLat
const CAMPECHE_BBOX = "-90.68,19.65,-90.25,20.05";

const apiClient = axios.create({
  baseURL: "https://us1.locationiq.com/v1",
  timeout: 10000,
});

/* ===========================
   BÚSQUEDA DE UBICACIONES
=========================== */

export async function searchLocationCampeche(
  query: string
): Promise<LocationResult[]> {
  if (!query || query.trim().length < 3) {
    return [];
  }

  try {
    const response = await apiClient.get<any[]>("/search", {
      params: {
        key: API_KEY,
        q: query,
        format: "json",
        viewbox: CAMPECHE_BBOX,
        bounded: 1,
        countrycodes: "mx",
        "accept-language": "es",
        addressdetails: 1,
        limit: 10,
      },
    });

    // Si no hay resultados
    if (!Array.isArray(response.data)) {
      return [];
    }

    return response.data.map(item => ({
      lat: Number(item.lat),
      lon: Number(item.lon),
      nombre: item.display_name.split(",")[0],
      direccionCompleta: item.display_name,
    }));
  } catch (error: any) {
    // Silenciar "Unable to geocode" un error cuando no hay resultados
    if (
      error?.response?.data?.error === "Unable to geocode"
    ) {
      return [];
    }

    // Solo logueamos errores reales
    console.error(
      "Error real en geocodificación:",
      error?.response?.data || error.message
    );

    return [];
  }
}
