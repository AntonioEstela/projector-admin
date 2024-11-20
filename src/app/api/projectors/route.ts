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
        let temperatureResponse, lampHoursResponse;

        // Fetch real-time data sequentially
        console.log('Fetching power status for projector:', projector.ipAddress);
        const powerStatusResponse = await fetchRealTimeData(projector.ipAddress, 8080, COMMANDS.QUERY_POWER_STATUS)
          .then((res) => res.json())
          .then((data) => {
            console.log('Power status response:', data);
            return parsePowerStatusResponse(data.response);
          })
          .catch((error) => {
            console.log('Error while fetching power status', error);
            return null;
          });

        // Fetch temperature and lamp hours only if the projector is powered on
        if (powerStatusResponse === 'Encendido') {
          console.log('Fetching temperature for projector:', projector.ipAddress);
          temperatureResponse = await fetchRealTimeData(projector.ipAddress, 8080, COMMANDS.GET_TEMPERATURE)
            .then((res) => res.json())
            .then((data) => parseTemperatureResponse(data.response))
            .catch((error) => console.log(error));

          console.log('Fetching lamp hours for projector:', projector.ipAddress);
          lampHoursResponse = await fetchRealTimeData(projector.ipAddress, 8080, COMMANDS.GET_LAMP_HOURS)
            .then((res) => res.json())
            .then((data) => parseLampUsageResponse(data.response))
            .catch((error) => console.log(error));
        }

        // Parse responses
        const realTimeData = {
          powerStatus: powerStatusResponse ?? 'No Disponible',
          temperature: temperatureResponse ?? '0',
          lampHours: lampHoursResponse ?? '0',
        };

        const dashboardData = mapToDashboardColum(projector);
        dashboardData.estado = realTimeData.powerStatus;
        dashboardData.horasLampara = realTimeData.lampHours;
        dashboardData.temperatura = realTimeData.temperature;

        // Update lamp usage logs
        if (projector.estado === 'Encendido') {
          if (projector.lampHours !== dashboardData.horasLampara) {
            await LampUsageLog.create({
              projectorIp: projector.ipAddress,
              usageHours: dashboardData.horasLampara,
            });
          }

          await monitorProjectors();
        }
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
    if (typeof ids === 'string') {
      await Projector.findByIdAndDelete(ids);
      return NextResponse.json({ message: 'Projector deleted successfully' });
    }
    ids?.forEach(async (id: string) => {
      await Projector.findByIdAndDelete(id);
    });

    return NextResponse.json({ message: 'Projector deleted successfully' });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 403 });
  }
}
