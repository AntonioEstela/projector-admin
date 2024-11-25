import mongoose from 'mongoose';

const MaintenanceLogSchema = new mongoose.Schema({
  projectorIp: { type: String, required: true }, // IP única del proyector
  maintainedBy: { type: String, required: true }, // Nombre del usuario que realizó el mantenimiento
  description: { type: String, required: true }, // Descripción del mantenimiento realizado
  date: { type: Date, default: Date.now }, // Fecha del mantenimiento
});

export default mongoose.models.MaintenanceLog || mongoose.model('MaintenanceLog', MaintenanceLogSchema);
