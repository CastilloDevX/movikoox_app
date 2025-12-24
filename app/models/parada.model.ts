/* ===========================
   MODELO: PARADA
=========================== */

export interface Parada {
  id: number;
  nombre: string;
  latitud: number;
  longitud: number;
  rutas: string[];
}

/* ===========================
   RESPUESTAS AUXILIARES
=========================== */

export interface ParaderoCercanoResponse {
  ok: boolean;
  body: Parada;
  distance_km: number;
}
