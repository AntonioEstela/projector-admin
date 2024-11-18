import MaintenanceLog from '@/models/MaintenanceLog';

export async function GET(req: Request, { params }: { params: { projectorIp: string } }) {
  try {
    const { projectorIp } = params;

    if (!projectorIp) {
      return new Response('El IP del proyector es requerido', { status: 400 });
    }

    const maintenanceLogs = await MaintenanceLog.find({ projectorIp }).sort({ date: -1 });

    return new Response(JSON.stringify(maintenanceLogs), { status: 200 });
  } catch (error) {
    console.error('Error al obtener mantenimientos:', error);
    return new Response('Error al obtener mantenimientos', { status: 500 });
  }
}
