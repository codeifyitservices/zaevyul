import Customer from '../model/Customer.js';
import Order from '../model/Order.js';

export const getCustomers = async (req, res) => {
  const { search, status } = req.query;
  try {
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, customers });
  } catch (error) {
    console.error('Fetch customers error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Get order history for customer
    const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, customer, orders });
  } catch (error) {
    console.error('Fetch customer detail error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
