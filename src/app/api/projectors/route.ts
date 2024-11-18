import dbConnect from '@/lib/db';
import {
  mapToDashboardColum,
  parseLampUsageResponse,
  parsePowerStatusResponse,
  parseTemperatureResponse,
} from '@/lib/utils';
import { verifyJWT } from '@/middleware/auth';
import Projector from '@/models/Projectors';
import { NextRequest, NextResponse } from 'next/server';

import COMMANDS from '@/lib/constants';
import { fetchRealTimeData } from '@/app/server-lib/utils';
import { monitorProjectors } from '@/app/controllers/projectorMonitor';
import LampUsageLog from '@/models/LampUsageLog';

export async function GET() {
  try {
    await dbConnect();

    const projectors = await Projector.find();
    const projectorData = await Promise.all(
      projectors.map(async (projector) => {
        console.log(projector);
        const realTimeData = {
          powerStatus: await fetchRealTimeData(projector.ipAddress, 8080, COMMANDS.QUERY_POWER_STATUS)
            .then((res) => res.json())
            .then((data) => data.response),
          temperature: await fetchRealTimeData(projector.ipAddress, 8080, COMMANDS.GET_TEMPERATURE)
            .then((res) => res.json())
            .then((data) => data.response),
          lampHours: await fetchRealTimeData(projector.ipAddress, 8080, COMMANDS.GET_LAMP_HOURS)
            .then((res) => res.json())
            .then((data) => data.response),
        };

        const dashboardData = mapToDashboardColum(projector);
        dashboardData.estado = parsePowerStatusResponse(realTimeData.powerStatus);
        dashboardData.horasLampara = parseLampUsageResponse(realTimeData.lampHours);
        dashboardData.temperatura = parseTemperatureResponse(realTimeData.temperature);

        console.log(projector.lampHours, dashboardData.horasLampara);
        if (projector.lampHours !== dashboardData.horasLampara) {
          await LampUsageLog.create({
            projectorIp: projector.ipAddress,
            usageHours: dashboardData.horasLampara,
          });
        }

        await monitorProjectors();
        return {
          ...mapToDashboardColum(projector),
          ...dashboardData,
        };
      })
    );

    // Save all updated projectors to the database
    await Promise.all(
      projectorData.map(async (data) => {
        const existingProjector = await Projector.findById(data.id);
        if (existingProjector && JSON.stringify(existingProjector.toObject()) !== JSON.stringify(data)) {
          await Projector.findByIdAndUpdate(data.id, { lampHours: data.horasLampara }, { new: true });
        }
      })
    );

    return NextResponse.json(projectorData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error retrieving projectors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    verifyJWT(req);

    await dbConnect();

    const { estado, etiquetas, grupos, horasLampara, ip, modelo, nombre, referencia, temperatura, ubicacion } =
      await req.json();

    const newProjector = new Projector({
      groups: grupos,
      ipAddress: ip,
      lampHours: horasLampara,
      location: ubicacion,
      name: nombre,
      projectorModel: modelo,
      reference: referencia,
      status: estado,
      tags: etiquetas,
      temperature: temperatura,
    });

    await newProjector.save();

    return NextResponse.json({ message: 'Projector added successfully' });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 403 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    verifyJWT(req);

    await dbConnect();

    const { estado, etiquetas, grupos, horasLampara, id, ip, modelo, nombre, referencia, temperatura, ubicacion } =
      await req.json();

    const updatedProjector = {
      groups: grupos,
      ipAddress: ip,
      lampHours: horasLampara,
      location: ubicacion,
      name: nombre,
      projectorModel: modelo,
      reference: referencia,
      status: estado,
      tags: etiquetas,
      temperature: temperatura,
    };

    await Projector.findByIdAndUpdate(id, updatedProjector);

    return NextResponse.json({ message: 'Projector updated successfully' });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 403 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    verifyJWT(req);

    await dbConnect();

    const ids = await req.json();

    ids?.forEach(async (id: string) => {
      await Projector.findByIdAndDelete(id);
    });

    return NextResponse.json({ message: 'Projector deleted successfully' });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 403 });
  }
}
