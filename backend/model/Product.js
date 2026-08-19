import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  sku: { type: String, required: true, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  basePrice: { type: Number, required: true },
  discountPrice: { type: Number, default: null },
  costPrice: { type: Number, default: null },
  quantity: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  tags: [{ type: String }],
  gender: { type: String, enum: ['men', 'women', 'neutral'], default: 'neutral' },
  featured: { type: Boolean, default: false },
  featuredOrder: { type: Number, default: null, min: 1, max: 6 },
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
  },
  sizes: [{
    size: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: null },
    quantity: { type: Number, default: 0 }
  }],
  colors: [{
    name: { type: String, required: true },
    mainImage: { type: String, required: true },
    galleryImages: [{ type: String }],
    sizes: [{
      size: { type: String, required: true },
      price: { type: Number, required: true },
      discountPrice: { type: Number, default: null },
      quantity: { type: Number, default: 0 }
    }]
  }]
}, { timestamps: true });

// Index for low-stock queries
ProductSchema.index({ quantity: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ featured: 1, featuredOrder: 1 });

export default mongoose.model('Product', ProductSchema);
