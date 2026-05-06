const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  partId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Part', required: true },
  name:         { type: String, required: true },
  category:     { type: String, required: true },
  imageUrl:     { type: String, default: '' },
  quantity:     { type: Number, required: true, min: 1 },
  priceAtOrder: { type: Number, required: true, min: 0 }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email:    { type: String, required: true },
  address:  { type: String, required: true },
  city:     { type: String, required: true },
  state:    { type: String, required: true },
  zip:      { type: String, required: true },
  country:  { type: String, default: 'US' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buildName:       { type: String, default: 'Custom Drone Build', trim: true },
  parts:           [orderItemSchema],
  totalPrice:      { type: Number, required: true, min: 0 },
  shippingMethod:  { type: String, enum: ['standard', 'priority'], default: 'standard' },
  shippingCost:    { type: Number, default: 0 },
  tax:             { type: Number, default: 0 },
  shippingAddress: shippingAddressSchema,
  status:          {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'confirmed'
  }
}, { timestamps: true });

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
