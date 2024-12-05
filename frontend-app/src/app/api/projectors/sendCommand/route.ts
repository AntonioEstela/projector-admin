import EventLog from '@/models/EventLog';
import COMMANDS from '@/lib/constants';
import net from 'net';
import Projector from '@/models/Projectors';
import { NextResponse } from 'next/server';

export async function POST(req: Request): Promise<Response> {
  const { host, port, command }: { host: string; port: number; command: string } = await req.json();

  const commandKey = Object.keys(COMMANDS).find((key) => COMMANDS[key] === command);
  const projector = await Projector.findOne({ ipAddress: host });

  await EventLog.create({
    projectorIp: host,
    projectorName: projector?.name,
    eventType: commandKey,
  });

  return new Promise((resolve) => {
    // Create a new TCP client
    const client = new net.Socket();

    // Convert command from hexadecimal string to Buffer
    const commandBuffer = Buffer.from(command.replace(/\s+/g, ''), 'hex');

    // Set a timeout for the connection
    const connectionTimeout = setTimeout(() => {
      console.error('Connection timeout');
      client.destroy(); // Ensure connection is closed
      resolve(
        NextResponse.json(
          {
            status: 'error',
            message: 'Connection timeout',
          },
          { status: 500 }
        )
      );
    }, Number(process.env.NEXT_PUBLIC_DEFAULT_TIMEOUT) ?? 3000);

    try {
      // Connect to the device
      client.connect(port, host, () => {
        console.log(`Connected to ${host}:${port}`);
        clearTimeout(connectionTimeout); // Clear the timeout on successful connection
        client.write(commandBuffer);
      });

      // Handle data received from the device
      client.on('data', (data) => {
        clearTimeout(connectionTimeout); // Clear the timeout on data reception
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
        clearTimeout(connectionTimeout); // Clear the timeout on error
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
        clearTimeout(connectionTimeout); // Clear the timeout on close
        console.log('Connection closed');
      });
    } catch (error) {
      clearTimeout(connectionTimeout); // Clear the timeout on exception
      console.error('Error:', error);
      resolve(
        NextResponse.json(
          {
            status: 'error',
            message: error,
          },
          { status: 500 }
        )
      );
    }
  });
}
