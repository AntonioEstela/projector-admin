const mongoose = require('mongoose');

const projectorSchema = new mongoose.Schema({
  ipAddress: { type: String, required: true },
  name: { type: String, required: true },
  status: { type: String },
  lampHours: { type: Number, default: 0 },
  temperature: { type: Number, default: 0 },
});

const Projector = mongoose.model('Projector', projectorSchema);

module.exports = Projector;
