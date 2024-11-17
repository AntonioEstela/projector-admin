import { NextResponse } from 'next/server';
import net from 'net';

export async function POST(req: Request) {
  const { host, port, command } = await req.json();

  return new Promise((resolve) => {
    // Create a new TCP client
    const client = new net.Socket();

    // Convert command from hexadecimal string to Buffer
    const commandBuffer = Buffer.from(command.replace(/\s+/g, ''), 'hex');

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
      console.error('Connection error:', err.message);
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
