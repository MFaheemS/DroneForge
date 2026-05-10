const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  partId:   { type: String, required: true },
  name:     { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  price:    { type: Number, required: true },
  weight:   { type: Number, default: 0 },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items:            { type: [cartItemSchema], default: [] },
  pendingBuildName: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
