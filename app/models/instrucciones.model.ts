/* ===========================
   MODELOS BASE
=========================== */

export interface Coordenada {
  lat: number;
  lon: number;
}

export interface Parada {
  id: number;
  nombre: string;
  latitud: number;
  longitud: number;
  rutas: string[];
}

/* ===========================
   INSTRUCCIONES
=========================== */

export interface WalkInstruction {
  type: "walk";
  distance_km: number;
  minutes: number;
  from?: Coordenada;
  to?: Coordenada;
  from_stop?: Parada;
  to_stop?: Parada;
}

export interface BusInstruction {
  type: "bus";
  bus: string;
  distance_km: number;
  minutes: number;
  stops_count: number;
  isEje: boolean;
  from_stop: Parada;
  to_stop: Parada;
}

export type Instruccion = WalkInstruction | BusInstruction;

/* ===========================
   RESUMEN
=========================== */

export interface InstructionSummary {
  num_buses: number;
  eje_buses: number;
  non_eje_buses: number;
  bus_km: number;
  bus_minutes: number;
  walk_km: number;
  walk_minutes: number;
  total_minutes: number;
}

/* ===========================
   RESPUESTA COMPLETA
=========================== */

export interface InstruccionesResponse {
  ok: boolean;
  isAprox: boolean;
  instructions: Instruccion[];
  summary: InstructionSummary;
}
