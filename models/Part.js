const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['frame', 'motors', 'propellers', 'battery', 'flightController', 'camera', 'ESC', 'transmitter']
  },
  price:       { type: Number, required: true, min: 0 },
  weight:      { type: Number, required: true, min: 0 }, // grams
  description: { type: String, required: true, trim: true },
  imageUrl:    { type: String, default: '' },
  specs:       { type: Map, of: String, default: {} },
  stock:       { type: Number, default: 10, min: 0 },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

partSchema.index({ category: 1, price: 1 });
partSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Part', partSchema);
