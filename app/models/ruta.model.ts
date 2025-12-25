import { Parada } from "./parada.model";

export interface Ruta {
  nombre: string;
  paradas: Parada[];
}
