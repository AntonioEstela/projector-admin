import MantainanceLog from '@/models/MaintenanceLog';

export async function POST(req: Request) {
  try {
    const { projectorIp, maintainedBy, description, date } = await req.json();

    if (!projectorIp || !maintainedBy || !description || !date) {
      return new Response('Todos los campos son requeridos', { status: 400 });
    }

    const maintenance = new MantainanceLog({ projectorIp, maintainedBy, description, date });
    await maintenance.save();

    return new Response(JSON.stringify({ message: 'Mantenimiento registrado correctamente' }), { status: 201 });
  } catch (error) {
    console.error('Error al registrar mantenimiento:', error);
    return new Response('Error al registrar mantenimiento', { status: 500 });
  }
}
