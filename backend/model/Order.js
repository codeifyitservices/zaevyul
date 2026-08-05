import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerName: { type: String, required: true },
  status: { type: String, enum: ['pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'], default: 'pending' },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Credit Card' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded', 'failed'], default: 'pending' },
  trackingNumber: { type: String, default: null },
  shippingAddress: {
    line1: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    zip: { type: String, required: true }
  },
  notes: { type: String, default: '' }
}, { timestamps: true });

// Indexes for reports & order-list queries
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ customer: 1 });

export default mongoose.model('Order', OrderSchema);
