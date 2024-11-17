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
import net from 'net';
import COMMANDS from '@/lib/constants';

async function fetchRealTimeData(host: string, port: number, command: string): Promise<NextResponse> {
  return new Promise((resolve) => {
    // Create a new TCP client
    const client = new net.Socket();

    // Convert command from hexadecimal string to Buffer
    const commandBuffer = Buffer.from(command.replace(/\s+/g, ''), 'hex');

    if (process.env.NODE_ENV === 'development') {
      let response;
      console.log(`Connecting to ${host}:${port}`);
      switch (command) {
        case COMMANDS.QUERY_POWER_STATUS:
          console.log('Querying power status');
          response = '05 14 00 03 00 00 00 02 19';
          break;
        case COMMANDS.GET_TEMPERATURE:
          console.log('Querying temperature');
          response = '05 14 00 0A 00 00 00 29 01 00 00 00 00 00 00 48';
          break;
        case COMMANDS.GET_LAMP_HOURS:
          console.log('Querying lamp hours');
          response = '05 14 00 06 00 00 00 B8 0B 00 00 DD';
          break;
        default:
          console.log('Unknown command');
      }
      resolve(
        NextResponse.json({
          status: 'success',
          response,
        })
      );
    }

    // Connect to the device
    client.connect(port, host, () => {
      console.log(`Connected to ${host}:${port}`);
      client.write(commandBuffer);
    });

    // Handle data received from the device
    client.on('data', (data) => {
      console.log('Received response:', data.toString('hex'));
      client.destroy(); // Close the connection after receiving data

      // Respond to the client with the data
      resolve(
        NextResponse.json({
          status: 'success',
          response: data.toString('hex'),
        })
      );
    });

    // Handle connection errors
    client.on('error', (err) => {
      console.error('Connection error:', err);
      client.destroy(); // Ensure connection is closed
      resolve(
        NextResponse.json(
          {
            status: 'error',
            message: err.message,
          },
          { status: 500 }
        )
      );
    });

    // Handle connection closure
    client.on('close', () => {
      console.log('Connection closed');
    });
  });
}

export async function GET() {
  try {
    await dbConnect();

    const projectors = await Projector.find();
    const projectorData = await Promise.all(
      projectors.map(async (projector) => {
        console.log(projector);
        const realTimeData = {
          inputStatus: await fetchRealTimeData(projector.ipAddress, 8080, COMMANDS.QUERY_INPUT_STATUS)
            .then((res) => res.json())
            .then((data) => data.response),
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
        return {
          ...mapToDashboardColum(projector),
          ...dashboardData,
        };
      })
    );

    console.log(projectorData);
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
