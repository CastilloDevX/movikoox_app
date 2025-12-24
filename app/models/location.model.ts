/* ===========================
   MODELOS DE UBICACIÓN
=========================== */

export interface LocationResult {
  lat: number;
  lon: number;
  nombre: string;
  direccionCompleta: string;
}

interface NominatimAddress {
  municipality?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  country?: string;
}

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
  importance: number;
}


export interface LocationResult {
  lat: number;
  lon: number;
  nombre: string;
  direccionCompleta: string;
}