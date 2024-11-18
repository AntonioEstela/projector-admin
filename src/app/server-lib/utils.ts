import COMMANDS from '@/lib/constants';
import net from 'net';
import { NextResponse } from 'next/server';

export async function fetchRealTimeData(host: string, port: number, command: string): Promise<NextResponse> {
  return new Promise((resolve) => {
    // Create a new TCP client
    const client = new net.Socket();

    // Convert command from hexadecimal string to Buffer
    const commandBuffer = Buffer.from(command.replace(/\s+/g, ''), 'hex');

    if (process.env.NODE_ENV === 'development') {
      let response;
      console.log(`Command: ${command}`);
      switch (command) {
        case COMMANDS.QUERY_POWER_STATUS:
          console.log('Querying power status');
          response = '05 14 00 03 00 00 00 02 19';
          break;
        case COMMANDS.GET_TEMPERATURE:
          console.log('Querying temperature');
          response = '05 14 00 0A 00 00 00 B6 03 00 00 00 00 00 00 48';
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
