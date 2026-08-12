import Order from "../model/Order.js";
import Customer from "../model/Customer.js";
import { sendOrderStatusEmail } from "../services/emailService.js";
import { escapeRegex } from "./public.js";

/**
 * GET /api/admin/orders
 * Supports regex escaping (AUD-021) and pagination (AUD-025).
 */
export const getOrders = async (req, res) => {
  const { search, status, page = 1, limit = 0 } = req.query;
  try {
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { orderNumber: { $regex: safeSearch, $options: "i" } },
        { customerName: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = parseInt(limit, 10) || 0;

    let query = Order.find(filter).sort({ createdAt: -1 });
    if (limitNum > 0) {
      query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const [orders, totalCount] = await Promise.all([
      query,
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      totalCount,
      page: pageNum,
      totalPages: limitNum > 0 ? Math.ceil(totalCount / limitNum) : 1,
    });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("customer");
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Fetch order detail error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const updateOrder = async (req, res) => {
  const { status, trackingNumber, paymentStatus } = req.body;
  try {
    const order = await Order.findById(req.params.id).populate("customer");
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const statusChanged = status && status !== order.status;

    if (status) order.status = status;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    // If order was delivered or cancelled, update customer spent statistics (AUD-014)
    if (status === "delivered" || status === "cancelled") {
      const customer = await Customer.findById(order.customer);
      if (customer) {
        const customerOrders = await Order.find({
          customer: customer._id,
          status: "delivered",
        });
        customer.orderCount = customerOrders.length;
        customer.totalSpent = customerOrders.reduce(
          (sum, o) => sum + o.total,
          0,
        );
        customer.avgOrderValue =
          customer.orderCount > 0
            ? Math.round(customer.totalSpent / customer.orderCount)
            : 0;
        customer.lastOrder =
          customerOrders.length > 0 ? customerOrders[0].createdAt : null;
        await customer.save();
      }
    }

    // Dispatch status update email if status changed (AUD-023)
    if (statusChanged && order.customer?.email) {
      sendOrderStatusEmail(order, order.customer.email).catch((err) =>
        console.error("Email dispatch error on updateOrder:", err),
      );
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Update order error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const addOrderNote = async (req, res) => {
  const { notes } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.notes = notes;
    await order.save();

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Add order note error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
