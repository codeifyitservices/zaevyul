import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, default: '' },
  content: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  featuredImage: { type: String, default: null },
  categories: [{ type: String }],
  tags: [{ type: String }],
  seo: {
    title: { type: String, default: '' },
    description: { type: String, default: '' }
  },
  publishedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('Blog', BlogSchema);
