import dbConnect from '@/lib/db';
import { mapToDashboardColum } from '@/lib/utils';
import { verifyJWT } from '@/middleware/auth';
import Projector from '@/models/Projectors';
import { NextRequest, NextResponse } from 'next/server';

type DbProjector = {
  _id: string;
  name: string;
  projectorModel: string;
  location: string;
  ipAddress: string;
  status: string;
  lampHours: number;
  tags: string[];
  reference: string;
  groups: string;
};

export async function GET() {
  try {
    await dbConnect();

    const projectors = await Projector.find();

    const mappedProjectors = projectors.map((projector: DbProjector) => mapToDashboardColum(projector));
    console.log(mappedProjectors);
    return NextResponse.json(mappedProjectors);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Error al obtener los proyectores' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    verifyJWT(req);

    await dbConnect();

    const { ip, nombre, modelo, referencia, horasLampara, grupos, etiquetas, ubicacion, estado } = await req.json();

    const newProjector = new Projector({
      name: nombre,
      projectorModel: modelo,
      location: ubicacion,
      ipAddress: ip,
      status: estado,
      lampHours: horasLampara,
      tags: etiquetas,
      reference: referencia,
      groups: grupos,
    });

    await newProjector.save();

    return NextResponse.json({ message: 'Projector added successfully' });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 403 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    verifyJWT(req);

    await dbConnect();

    const id = await req.json();

    await Projector.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Projector deleted successfully' });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 403 });
  }
}
