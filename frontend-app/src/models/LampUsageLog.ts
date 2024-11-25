import mongoose from 'mongoose';

const LampUsageLogSchema = new mongoose.Schema({
  projectorIp: { type: String, required: true },
  projectorName: { type: String, required: true },
  usageHours: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  eventType: { type: String, default: 'LAMP_USAGE_CHANGE' },
});

export default mongoose.models.LampUsageLog || mongoose.model('LampUsageLog', LampUsageLogSchema);
