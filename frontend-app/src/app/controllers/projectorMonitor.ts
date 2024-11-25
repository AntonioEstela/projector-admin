import COMMANDS from '@/lib/constants';
import { parseTemperatureResponse } from '@/lib/utils';
import Projector from '@/models/Projectors';
import nodemailer from 'nodemailer';
import { fetchRealTimeData } from '../server-lib/utils';
import User from '@/models/User';

const THRESHOLD_TEMPERATURE = 75; // Threshold in °C
const ALERT_DELAY_HOURS = 1; // Delay between alerts in hours

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NEXT_PUBLIC_EMAIL_USER,
    pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD,
  },
});

async function sendOverheatingAlert(projectorName: string, temperature: number, recipient: string) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipient,
    subject: `Overheating Alert: ${projectorName}`,
    html: `
      <p>The projector <strong>${projectorName}</strong> is overheating.</p>
      <p>Current temperature: <strong>${temperature}°C</strong></p>
      <p>Please take immediate action to prevent damage.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export async function monitorProjectors() {
  const projectors = await Projector.find();
  const users = await User.find();

  const emailAdminUsers = users.filter((user) => user.role === 'admin').map((user) => user.email);

  if (!emailAdminUsers.length) {
    console.log('No admin users found. Skipping projector monitoring.');
    return;
  }

  for (const projector of projectors) {
    try {
      // Skip if the alert delay is active
      if (projector.nextAlertDate && new Date() < new Date(projector.nextAlertDate)) {
        console.log(`Skipping alert for ${projector.name} (next alert at ${projector.nextAlertDate})`);
        continue;
      }

      // Fetch real-time temperature
      const temperatureHex = await fetchRealTimeData(projector.host, projector.port, COMMANDS.GET_TEMPERATURE)
        .then((res) => res.json())
        .then((data) => data.response);
      const temperature = parseTemperatureResponse(temperatureHex);

      if (temperature && temperature > THRESHOLD_TEMPERATURE) {
        console.log(`Overheating detected on ${projector.name} (${temperature}°C). Sending alert...`);
        emailAdminUsers.forEach((email) => sendOverheatingAlert(projector.name, temperature, email));

        // Update projector to mark the alert as sent
        projector.hasSendEmailAlert = true;
        projector.nextAlertDate = new Date(Date.now() + ALERT_DELAY_HOURS * 60 * 60 * 1000); // Delay of 1 hour
        await projector.save();
      }
    } catch (error) {
      console.error(`Error monitoring projector ${projector.name}:`, error);
    }
  }
}
