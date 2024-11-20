import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Parser } from 'json2csv';
import { jsPDF } from 'jspdf';

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
    temperatura: projector.temperature,
  };
}

export const getBaseURL = () =>
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_BASE_URL_PROD
    : process.env.NEXT_PUBLIC_API_BASE_URL_DEV;

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAdmin = () => {
  const user = getUser();
  return user?.role === 'admin';
};

/**
 * Parses the temperature response from the projector.
 * @param response - The hex string response from the projector (e.g., "05 14 00 0A 00 00 00 29 01 00 00 00 00 00 00 48")
 * @returns The temperature in degrees Celsius.
 */
export function parseTemperatureResponse(response: string): number | null {
  // Split the hex string into an array of byte strings
  console.log('parsing temperature', response);
  const sanitizedResponse = response.replace(/\s+/g, '');
  const bytes = sanitizedResponse.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16));

  // Ensure we have enough bytes to parse temperature
  if (!bytes || bytes.length < 14) {
    console.error('Invalid response length');
    return null;
  }

  // Extract bytes 7 to 10 (0-indexed as bytes[6] to bytes[9])
  const tempBytes = bytes.slice(7, 11);

  // Convert to a single integer (ddccbbaa in the format dd cc bb aa)
  const temperatureHex = tempBytes
    .reverse()
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  const temperatureValue = parseInt(temperatureHex, 16);

  // Divide by 10 to get the temperature in degrees Celsius
  const temperatureCelsius = temperatureValue / 10;

  return temperatureCelsius;
}

/**
 * Parses the power status response from the projector.
 * @param response - The raw hex string response from the projector.
 * @returns The power status as a human-readable string.
 */
export function parsePowerStatusResponse(response: string): string | null {
  // Remove spaces if any and split the hex string into byte pairs
  if (!response) {
    throw new Error('Empty power status response');
  }
  const sanitizedResponse = response.replace(/\s+/g, '');
  const bytes = sanitizedResponse.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16));

  if (!bytes || bytes.length < 8) {
    console.error('Invalid response length or format');
    return null;
  }

  // Byte 7 (index 6 in 0-based index) contains the power status
  const powerStatusByte = bytes[7];

  // Interpret the power status byte
  switch (powerStatusByte) {
    case 0x00:
      return 'Apagado';
    case 0x01:
      return 'Encendido';
    case 0x02:
      return 'Encendido';
    case 0x03:
      return 'Apagado';
    default:
      return 'En Mantenimiento';
  }
}

/**
 * Parses the lamp usage hours from the projector's response.
 * @param response - The hex string response from the projector (e.g., "05 14 00 06 00 00 00 B8 0B 00 00 DD")
 * @returns The lamp usage time in hours.
 */
export function parseLampUsageResponse(response: string): number | null {
  // Split the hex string into an array of bytes
  console.log('parsing lamp usage', response);
  const sanitizedResponse = response.replace(/\s+/g, '');
  const bytes = sanitizedResponse.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16));

  // Ensure we have enough bytes to parse the lamp usage
  if (!bytes || bytes.length < 12) {
    console.error('Invalid response length');
    return null;
  }

  // Extract bytes 7 to 10 (0-indexed as bytes[6] to bytes[9])
  const usageBytes = bytes.slice(7, 11);

  // Convert to a single integer (ddccbbaa format in little-endian)
  const usageHex = usageBytes
    .reverse()
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  const usageHours = parseInt(usageHex, 16);

  return usageHours;
}

export function exportLogsToCSV(data: any[], fields: string[]): string {
  const parser = new Parser({ fields });
  return parser.parse(data);
}

export function exportLogsToPDF(data: any[], title: string): Blob {
  const doc = new jsPDF();
  doc.text(title, 10, 10);

  data.forEach((log, index) => {
    doc.text(
      `${index + 1}. ${new Date(log.timestamp).toLocaleString()} - ${log.projectorIp} - ${log.type} - ${log.details}`,
      10,
      20 + index * 10
    );
  });

  return doc.output('blob');
}
