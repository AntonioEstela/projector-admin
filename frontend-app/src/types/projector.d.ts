export type Projector = {
  id?: string;
  ip: string;
  nombre: string;
  modelo: string;
  referencia: string;
  horasLampara: number;
  grupos: string;
  etiquetas: string[];
  ubicacion: string;
  estado: 'Encendido' | 'Apagado' | 'No Disponible';
  temperatura: number;
};
