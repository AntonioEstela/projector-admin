import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mapToDashboardColum(projector: any) {
  return {
    id: projector._id,
    ip: projector.ipAddress,
    nombre: projector.name,
    modelo: projector.projectorModel,
    referencia: projector.reference,
    horasLampara: projector.lampHours,
    grupos: projector.groups,
    etiquetas: projector.tags,
    ubicacion: projector.location,
    estado: projector.status,
  };
}
