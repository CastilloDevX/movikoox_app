import { InstruccionesResponse } from "@/app/models/instrucciones.model";
import { Parada, ParaderoCercanoResponse } from "@/app/models/parada.model";
import axios from "axios";

/* ===========================
   CONFIGURACIÓN BASE
=========================== */

const api = axios.create({
  baseURL: "https://movikoox.vercel.app/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===========================
   INTERCEPTOR DE ERRORES
=========================== */

api.interceptors.response.use(
  response => response,
  error => {
    console.error(
      "MOVIKOOX API ERROR:",
      error?.response?.data || error.message
    );
    throw error;
  }
);

/* ===========================
   ENDPOINTS
=========================== */

/* Obtener todas las paradas */
export async function getParadas(): Promise<Parada[]> {
  const res = await api.get("/paradas");
  return res.data;
}

/* Obtener parada por ID */
export async function getParadaById(id: number): Promise<Parada> {
  const res = await api.get(`/paradas/${id}`);
  return res.data;
}

/* Obtener parada más cercana */
export async function getParaderoCercano(
  latitud: number,
  longitud: number
): Promise<{ parada: Parada; distance_km: number }> {
  const res = await api.get<ParaderoCercanoResponse>(
    "/paradas/cercana",
    { params: { latitud, longitud } }
  );

  return {
    parada: res.data.body,
    distance_km: res.data.distance_km,
  };
}

/* Obtener paradas por ruta */
export async function getParadasByRuta(
  nombreRuta: string
): Promise<Parada[]> {
  const res = await api.get(`/paradas/bus/${nombreRuta}`);
  return res.data;
}

/* Calcular instrucciones de viaje */
export async function getInstrucciones(
  inicioLat: number,
  inicioLon: number,
  destinoLat: number,
  destinoLon: number
): Promise<InstruccionesResponse> {
  const res = await api.get("/instrucciones", {
    params: {
      inicio: `${inicioLat},${inicioLon}`,
      destino: `${destinoLat},${destinoLon}`,
    },
  });

  return res.data;
}
