import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  storeName: { type: String, default: 'Zaevyul Pashmina' },
  tagline: { type: String, default: 'Timeless · Authentic · Handcrafted' },
  email: { type: String, default: 'hello@zaevyul.com' },
  phone: { type: String, default: '+91 194 123 4567' },
  address: { type: String, default: 'Residency Road, Srinagar, Jammu & Kashmir 190001' },
  currency: { type: String, default: 'INR' },
  currencySymbol: { type: String, default: '₹' },
  taxRate: { type: Number, default: 5 },
  freeShippingAbove: { type: Number, default: 10000 },
  socialLinks: {
    instagram: { type: String, default: 'https://instagram.com/zaevyul' },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    pinterest: { type: String, default: '' }
  },
  paymentGateways: {
    razorpay: {
      keyId: { type: String, default: '' },
      enabled: { type: Boolean, default: false }
    },
    stripe: {
      keyId: { type: String, default: '' },
      enabled: { type: Boolean, default: false }
    }
  }
}, { timestamps: true });

export default mongoose.model('Settings', SettingsSchema);
