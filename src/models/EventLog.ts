import COMMANDS from '@/lib/constants';
import mongoose, { Model } from 'mongoose';

export interface IEventLog extends mongoose.Document {
  projectorIp: string;
  eventType: string;
  timestamp: Date;
}

const EventLogSchema = new mongoose.Schema<IEventLog>({
  projectorIp: { type: String, required: true },
  eventType: { type: String, enum: Object.keys(COMMANDS), required: true },
  timestamp: { type: Date, default: Date.now },
});

const EventLog: Model<IEventLog> = mongoose.models.EventLog || mongoose.model<IEventLog>('EventLog', EventLogSchema);
export default EventLog;
