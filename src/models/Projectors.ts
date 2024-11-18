// models/Projector.ts
import mongoose, { Document, Schema, model } from 'mongoose';

export interface IProjector extends Document {
  name: string;
  projectorModel: string;
  location: string;
  ipAddress: string;
  status: string;
  tags: string[];
  lampHours: number;
  reference: string;
  groups: string;
  temperature: number;
  hasSendAlert: boolean;
  nextAlertDate: Date;
}

const ProjectorSchema = new Schema<IProjector>({
  name: {
    type: String,
    required: true,
  },
  projectorModel: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
    required: true,
    unique: true, // IP address should be unique
  },
  status: {
    type: String,
    enum: ['Encendido', 'Apagado', 'En mantenimiento'],
    default: 'Apagado',
  },
  tags: {
    type: [String],
    default: [],
  },
  lampHours: {
    type: Number,
    default: 0,
  },
  reference: {
    type: String,
    required: true,
  },
  groups: {
    type: String,
    required: true,
  },
  temperature: {
    type: Number,
    default: 0,
  },
  hasSendAlert: {
    type: Boolean,
    default: false,
  },
  nextAlertDate: {
    type: Date,
    default: Date.now,
  },
});

const Projector = mongoose.models.Projector || model<IProjector>('Projector', ProjectorSchema);
export default Projector;
