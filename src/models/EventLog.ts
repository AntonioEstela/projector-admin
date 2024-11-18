import mongoose, { Model } from 'mongoose';

export interface IEventLog extends mongoose.Document {
  projectorIp: string;
  eventType: string;
  timestamp: Date;
}

const EventLogSchema = new mongoose.Schema<IEventLog>({
  projectorIp: { type: String, required: true },
  eventType: { type: String, enum: ['POWER_ON', 'POWER_OFF'], required: true },
  timestamp: { type: Date, default: Date.now },
});

const EventLog: Model<IEventLog> = mongoose.models.EventLog || mongoose.model<IEventLog>('EventLog', EventLogSchema);
export default EventLog;
