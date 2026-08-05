import Order from '../model/Order.js';
import Customer from '../model/Customer.js';

export const getOrders = async (req, res) => {
  const { search, status } = req.query;
  try {
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Fetch order detail error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateOrder = async (req, res) => {
  const { status, trackingNumber, paymentStatus } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status) order.status = status;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    // If order was delivered or cancelled, update customer spent statistics
    if (status === 'delivered' || status === 'cancelled') {
      const customer = await Customer.findById(order.customer);
      if (customer) {
        const customerOrders = await Order.find({ customer: customer._id, status: 'delivered' });
        customer.orderCount = customerOrders.length;
        customer.totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
        customer.avgOrderValue = customer.orderCount > 0 ? Math.round(customer.totalSpent / customer.orderCount) : 0;
        customer.lastOrder = customerOrders.length > 0 ? customerOrders[0].createdAt : null;
        await customer.save();
      }
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Update order error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const addOrderNote = async (req, res) => {
  const { notes } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.notes = notes;
    await order.save();

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Add order note error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
