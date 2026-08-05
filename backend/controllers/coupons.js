import Coupon from '../model/Coupon.js';

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.error('Fetch coupons error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    return res.status(201).json({ success: true, coupon });
  } catch (error) {
    console.error('Create coupon error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    return res.status(200).json({ success: true, coupon });
  } catch (error) {
    console.error('Update coupon error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    coupon.active = !coupon.active;
    await coupon.save();

    return res.status(200).json({ success: true, coupon });
  } catch (error) {
    console.error('Toggle coupon status error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    return res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
