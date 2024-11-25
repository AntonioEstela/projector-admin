const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const dotenv = require('dotenv');
const { sendCommand } = require('./lib/utils');
const Projector = require('./model/Projectors');
const { COMMANDS, SET_INPUT } = require('./lib/constants');
const cors = require('cors');

dotenv.config();

const app = express();
// Enable CORS for all origins (you can configure it to allow specific origins if needed)
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Helper: Map day abbreviations to cron day numbers
const dayMap = {
  Lu: 1, // Monday
  Ma: 2, // Tuesday
  Mi: 3, // Wednesday
  Ju: 4, // Thursday
  Vi: 5, // Friday
  Sa: 6, // Saturday
  Do: 0, // Sunday
};

// POST Endpoint for scheduling tasks
app.post('/schedule', async (req, res) => {
  try {
    const { ipAddresses, fromTime, toTime, daysOfWeek, input } = req.body;
    // Validate input
    if (!ipAddresses || !ipAddresses.length || !fromTime || !toTime || !daysOfWeek) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log('Scheduling tasks:', req.body);
    // Validate if all IPs are valid
    const projectors = await Projector.find({ ipAddress: { $in: ipAddresses } });
    if (projectors.length !== ipAddresses.length) {
      return res.status(404).json({ message: 'One or more projectors not found' });
    }

    // Validate time format
    const fromTimeParts = fromTime.split(':');
    const toTimeParts = toTime.split(':');
    if (fromTimeParts.length !== 2 || toTimeParts.length !== 2) {
      return res.status(400).json({ message: 'Invalid time format' });
    }

    // Parse hours and minutes
    const [fromHour, fromMinute] = fromTimeParts.map((val) => parseInt(val, 10));
    const [toHour, toMinute] = toTimeParts.map((val) => parseInt(val, 10));

    // validate that to hour is after from hour
    if (toHour < fromHour || (toHour === fromHour && toMinute <= fromMinute)) {
      return res.status(400).json({ message: 'Invalid time range' });
    }

    // Validate daysOfWeek format
    const days = daysOfWeek.map((day) => dayMap[day]);
    if (days.some((day) => day === undefined)) {
      return res.status(400).json({ message: 'Invalid daysOfWeek format. Use abbreviations like Lu,Ma,Mi.' });
    }

    // Schedule turn-on tasks for all projectors
    ipAddresses.forEach((ipAddress) => {
      days.forEach((day) => {
        const cronExpression = `${fromMinute} ${fromHour} * * ${day}`;
        console.log(cronExpression);
        cron.schedule(cronExpression, async () => {
          console.log(`Turning ON projector ${ipAddress} on day ${day}`);
          try {
            const response = await sendCommand(ipAddress, 8080, COMMANDS.POWER_ON);
            console.log(`Projector ${ipAddress} turned ON:`, response);

            // Schedule input change after 30 seconds, if input is provided in the request, by default HDMI 1
            setTimeout(async () => {
              try {
                await sendCommand(ipAddress, 8080, SET_INPUT(input ?? 'HDMI 1'));
              } catch (error) {
                console.error(`Failed to set input for projector ${ipAddress}, ${error.message}`);
                res.status(500).json({ message: `Failed to set input for projector ${ipAddress}, ${error.message}` });
              }
            }, 30000);
          } catch (error) {
            console.error(`Failed to turn ON projector ${ipAddress}, ${error.message}`);
            res.status(500).json({ message: `Failed to turn ON projector ${ipAddress}, ${error.message}` });
          }
        });
      });

      // Schedule turn-off tasks for all projectors
      days.forEach((day) => {
        const cronExpression = `${toMinute} ${toHour} * * ${day}`;
        cron.schedule(cronExpression, async () => {
          console.log(`Turning OFF projector ${ipAddress} on day ${day}`);
          try {
            const response = await sendCommand(ipAddress, 8080, COMMANDS.POWER_OFF);
            console.log(`Projector ${ipAddress} turned OFF:`, response);
          } catch (error) {
            console.error(`Failed to turn OFF projector ${ipAddress}, ${error.message}`);
            res.status(500).json({ message: `Failed to turn OFF projector ${ipAddress}, ${error.message}` });
          }
        });
      });
    });

    res.status(200).json({ message: 'Tasks scheduled successfully' });
  } catch (error) {
    console.error('Error scheduling tasks:', error);
    res.status(500).json({ message: 'Failed to schedule tasks' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Scheduler server running on port ${PORT}`);
});
