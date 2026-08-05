import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  sku: { type: String, required: true, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  basePrice: { type: Number, required: true },
  discountPrice: { type: Number, default: null },
  material: { type: String, default: '' },
  color: { type: String, default: '' },
  size: { type: String, default: '' },
  description: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  images: [{
    id: { type: String },
    name: { type: String },
    url: { type: String }
  }],
  seo: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    url: { type: String, default: '' }
  }
}, { timestamps: true });

// Index for low-stock queries
ProductSchema.index({ quantity: 1 });
ProductSchema.index({ category: 1 });

export default mongoose.model('Product', ProductSchema);
