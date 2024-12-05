import net from 'net';

/**
 * Fetch real-time data from the projector via TCP.
 * @param host - The IP address of the projector.
 * @param port - The TCP port of the projector (default: 8080).
 * @param command - The command to send in hexadecimal format.
 * @returns A Promise resolving with the device's response as a hex string.
 */
export async function sendCommand(host, port, command) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    const commandBuffer = Buffer.from(command.replace(/\s+/g, ''), 'hex');

    // Set a timeout for the connection
    const connectionTimeout = setTimeout(() => {
      console.error('Connection timeout');
      client.destroy();
      reject(new Error('Connection timeout'));
    }, process.env.DEFAULT_TIMEOUT);

    try {
      // Connect to the projector
      client.connect(port, host, () => {
        console.log(`Connected to ${host}:${port}`);
        clearTimeout(connectionTimeout);
        client.write(commandBuffer);
      });

      // Handle data received from the projector
      client.on('data', (data) => {
        clearTimeout(connectionTimeout);
        client.destroy();
        resolve(data.toString('hex')); // Return the hex response
      });

      // Handle connection errors
      client.on('error', (err) => {
        clearTimeout(connectionTimeout);
        client.destroy();
        reject(new Error(`Connection error: ${err.message}`));
      });

      // Handle connection closure
      client.on('close', () => {
        clearTimeout(connectionTimeout);
        console.log('Connection closed');
      });
    } catch (error) {
      clearTimeout(connectionTimeout);
      reject(error);
    }
  });
}
