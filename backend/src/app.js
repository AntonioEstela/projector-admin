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

// In-memory storage for cron jobs
const cronJobs = {};

// POST Endpoint for scheduling tasks
app.post('/schedule', async (req, res) => {
  try {
    const { ipAddresses, fromTime, toTime, daysOfWeek, input } = req.body;
    // Validate input
    if (!ipAddresses || !ipAddresses.length || !daysOfWeek) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate if all IPs are valid
    const projectors = await Projector.find({ ipAddress: { $in: ipAddresses } });
    if (projectors.length !== ipAddresses.length) {
      return res.status(404).json({ message: 'One or more projectors not found' });
    }

    // Parse and validate daysOfWeek
    const days = daysOfWeek.map((day) => dayMap[day]);
    if (days.some((day) => day === undefined)) {
      return res.status(400).json({ message: 'Invalid daysOfWeek format. Use abbreviations like Lu,Ma,Mi.' });
    }

    // Schedule turn-on tasks (if fromTime is provided)
    if (fromTime) {
      const [fromHour, fromMinute] = fromTime.split(':').map(Number);

      if (fromHour === undefined || fromMinute === undefined) {
        return res.status(400).json({ message: 'Invalid fromTime format' });
      }

      // Update database with `turnOnAt` for each projector
      await Promise.all(
        ipAddresses.map(async (ip) => {
          console.log('Updating projector:', ip);
          const projector = await Projector.findOne({ ipAddress: ip });

          if (projector) {
            console.log('Projector found, updating turnOnAt:', projector);
            await Projector.findByIdAndUpdate(projector._id, { turnOnAt: fromTime, scheduledDays: daysOfWeek });
          } else {
            console.error(`No projector found with IP: ${ip}`);
          }
        })
      );

      // Schedule the turn-on tasks
      ipAddresses.forEach((ipAddress) => {
        days.forEach((day) => {
          const cronExpression = `${fromMinute} ${fromHour} * * ${day}`;
          console.log(`Scheduling turn-on task: ${cronExpression} for projector ${ipAddress}`);
          const job = cron.schedule(cronExpression, async () => {
            console.log(`Turning ON projector ${ipAddress} on day ${day}`);
            try {
              await sendCommand(ipAddress, 8080, COMMANDS.POWER_ON);
              console.log(`Projector ${ipAddress} turned ON`);

              if (input) {
                setTimeout(async () => {
                  console.log(`Setting input for projector ${ipAddress}`);
                  await sendCommand(ipAddress, 8080, SET_INPUT(input ?? 'HDMI 1'));
                }, 30000); // Delay for input change
              }
            } catch (error) {
              console.error(`Failed to turn ON projector ${ipAddress}: ${error.message}`);
            }
          });
          // Store the job
          cronJobs[ipAddress] = cronJobs[ipAddress] || [];
          cronJobs[ipAddress].push(job);
        });
      });
    }

    // Schedule turn-off tasks (if toTime is provided)
    if (toTime) {
      const [toHour, toMinute] = toTime.split(':').map(Number);

      if (toHour === undefined || toMinute === undefined) {
        return res.status(400).json({ message: 'Invalid toTime format' });
      }

      // Update database with `turnOffAt` for each projector
      await Promise.all(
        ipAddresses.map(async (ip) => {
          console.log('Updating turnOffAt for projector:', ip);
          const projector = await Projector.findOne({ ipAddress: ip });

          if (projector) {
            console.log('Projector found, updating turnOffAt:', projector);
            await Projector.findByIdAndUpdate(projector._id, { turnOffAt: toTime, scheduledDays: daysOfWeek });
          } else {
            console.error(`No projector found with IP: ${ip}`);
          }
        })
      );

      // Schedule the turn-off tasks
      ipAddresses.forEach((ipAddress) => {
        days.forEach((day) => {
          const cronExpression = `${toMinute} ${toHour} * * ${day}`;
          console.log(`Scheduling turn-off task: ${cronExpression} for projector ${ipAddress}`);
          const job = cron.schedule(cronExpression, async () => {
            console.log(`Turning OFF projector ${ipAddress} on day ${day}`);
            try {
              await sendCommand(ipAddress, 8080, COMMANDS.POWER_OFF);
              console.log(`Projector ${ipAddress} turned OFF`);
            } catch (error) {
              console.error(`Failed to turn OFF projector ${ipAddress}: ${error.message}`);
            }
          });
          // Store the job
          cronJobs[ipAddress] = cronJobs[ipAddress] || [];
          cronJobs[ipAddress].push(job);
        });
      });
    }

    if (!fromTime && !toTime) {
      return res.status(400).json({ message: 'At least one of fromTime or toTime must be provided' });
    }

    res.status(200).json({ message: 'Tasks scheduled successfully' });
  } catch (error) {
    console.error('Error scheduling tasks:', error);
    res.status(500).json({ message: 'Failed to schedule tasks' });
  }
});

// POST Endpoint to cancel tasks
app.post('/cancel-schedule', (req, res) => {
  try {
    const { ipAddresses } = req.body;

    // Validate input
    if (!ipAddresses || !ipAddresses.length) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    ipAddresses.forEach(async (ipAddress) => {
      if (cronJobs[ipAddress]) {
        // search the projector in the database and update the turnOnAt and turnOffAt fields to an empty string
        await Projector.findOne({ ipAddress: ipAddress }).then(async (projector) => {
          if (projector) {
            await Projector.findByIdAndUpdate(projector._id, { turnOnAt: '', turnOffAt: '', scheduledDays: [] }).then(
              () => {
                console.log(`Updated projector ${ipAddress} with empty turnOnAt and turnOffAt`);
              }
            );
          }
        });
        cronJobs[ipAddress].forEach((job) => job.stop()); // Stop all jobs for the IP
        delete cronJobs[ipAddress]; // Remove from storage
        console.log(`Cancelled all tasks for projector ${ipAddress}`);
      }
    });

    res.status(200).json({ message: 'Tasks cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling tasks:', error);
    res.status(500).json({ message: 'Failed to cancel tasks' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Scheduler server running on port ${PORT}`);
});
