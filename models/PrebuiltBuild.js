const mongoose = require('mongoose');

const buildPartSchema = new mongoose.Schema({
  partId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Part', required: true },
  quantity: { type: Number, default: 1, min: 1 }
}, { _id: false });

const prebuiltBuildSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 600 },
  imageUrl:    { type: String, default: '' },
  specChips:   [{ type: String, trim: true }],  // e.g. ['5" Frame', '2306 Motors']
  parts:       [buildPartSchema],
  totalPrice:    { type: Number, default: 0, min: 0 },
  purchaseCount: { type: Number, default: 0, min: 0 },
  isActive:      { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('PrebuiltBuild', prebuiltBuildSchema);
