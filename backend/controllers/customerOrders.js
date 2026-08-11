import Order from '../model/Order.js';
import Customer from '../model/Customer.js';
import Product from '../model/Product.js';

/**
 * GET /api/customer/orders
 * Returns the order history for the logged-in customer (matched by email).
 */
export const getCustomerOrders = async (req, res) => {
  try {
    const email = req.customerUser.email;
    if (!email) {
      return res.status(200).json({ success: true, orders: [] });
    }

    // Find the corresponding admin Customer document by email
    const customerObj = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (!customerObj) {
      return res.status(200).json({ success: true, orders: [] });
    }

    const orders = await Order.find({ customer: customerObj._id })
      .populate('items.product', '_id name slug images')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('[customerOrders] getCustomerOrders error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

/**
 * POST /api/customer/orders
 * Creates a new order for the customer.
 */
export const placeCustomerOrder = async (req, res) => {
  const { items, subtotal, shipping, discount, total, paymentMethod, shippingAddress, notes } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart items are required.' });
  }

  try {
    const email = req.customerUser?.email || req.body.email;
    const name = req.customerUser?.name || req.body.name;
    const phone = req.customerUser?.phone || req.body.phone;

    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Name and email are required to place an order.' });
    }

    // Find or create admin Customer document to associate the order with
    let customerObj = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (!customerObj) {
      customerObj = await Customer.create({
        name,
        email: email.toLowerCase().trim(),
        phone: phone || '',
        city: shippingAddress?.city || '',
        country: shippingAddress?.country || 'India',
        status: 'active',
      });
    }

    // Generate unique order number (e.g. ZAE-YYYY-XXXX)
    const year = new Date().getFullYear();
    const count = await Order.countDocuments();
    const orderNumber = `ZAE-${year}-${String(count + 1).padStart(4, '0')}`;

    // Verify products exist and format order items
    const orderItems = [];
    for (const item of items) {
      const prod = await Product.findById(item.product || item._id);
      if (!prod) {
        return res.status(400).json({ success: false, message: `Product not found.` });
      }
      orderItems.push({
        product: prod._id,
        name: prod.name,
        qty: item.qty || item.quantity || 1,
        price: prod.discountPrice || prod.basePrice,
      });
    }

    const newOrder = await Order.create({
      orderNumber,
      customer: customerObj._id,
      customerName: name,
      status: 'pending',
      items: orderItems,
      subtotal: subtotal || total,
      shipping: shipping || 0,
      discount: discount || 0,
      total: total,
      paymentMethod: paymentMethod || 'UPI',
      paymentStatus: 'pending',
      shippingAddress: {
        line1: shippingAddress.line1 || shippingAddress.address || '',
        city: shippingAddress.city || '',
        country: shippingAddress.country || 'India',
        zip: shippingAddress.zip || shippingAddress.postalCode || '',
      },
      notes: notes || '',
    });

    // Update customer statistics
    const customerOrders = await Order.find({ customer: customerObj._id, status: 'delivered' });
    customerObj.orderCount = customerOrders.length;
    customerObj.totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
    customerObj.avgOrderValue = customerObj.orderCount > 0 ? Math.round(customerObj.totalSpent / customerObj.orderCount) : 0;
    customerObj.lastOrder = new Date();
    await customerObj.save();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order: newOrder,
    });
  } catch (error) {
    console.error('[customerOrders] placeCustomerOrder error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to place order.' });
  }
};
