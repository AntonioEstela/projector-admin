import net from 'net';
import { NextResponse } from 'next/server';

export async function fetchRealTimeData(host: string, port: number, command: string): Promise<NextResponse> {
  return new Promise((resolve) => {
    // Create a new TCP client
    const client = new net.Socket();

    // Convert command from hexadecimal string to Buffer
    const commandBuffer = Buffer.from(command.replace(/\s+/g, ''), 'hex');

    try {
      // Connect to the device
      client.connect(port, host, () => {
        console.log(`Connected to ${host}:${port}`);
        client.write(commandBuffer);
      });

      // Handle data received from the device
      client.on('data', (data) => {
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
    } catch (error) {
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
