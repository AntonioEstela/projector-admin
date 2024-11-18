import EventLog from '@/models/EventLog';
import COMMANDS from '@/lib/constants';
import net from 'net';

export async function POST(req: Request): Promise<Response> {
  const { host, port, command }: { host: string; port: number; command: string } = await req.json();

  const commandKey = Object.keys(COMMANDS).find((key) => COMMANDS[key] === command);

  await EventLog.create({
    projectorIp: host,
    eventType: commandKey,
  });

  return new Promise((resolve, reject) => {
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
      console.log(`Received data: ${data}`);
      client.destroy(); // Close the connection
      resolve(new Response('Command sent successfully', { status: 200 }));
    });

    // Handle connection errors
    client.on('error', (err) => {
      console.error(`Connection error: ${err.message}`);
      client.destroy(); // Close the connection
      reject(new Response('Failed to send command', { status: 500 }));
    });

    // Handle connection close
    client.on('close', () => {
      console.log('Connection closed');
    });
  });
}
