import crypto from "crypto";
import Order from "../model/Order.js";
import Customer from "../model/Customer.js";
import CustomerUser from "../model/CustomerUser.js";
import Product from "../model/Product.js";
import Coupon from "../model/Coupon.js";
import Settings from "../model/Settings.js";
import { sendOrderConfirmationEmail } from "../services/emailService.js";

/**
 * GET /api/customer/orders
 * Returns order history for the logged-in customer (matched by email or phone).
 */
export const getCustomerOrders = async (req, res) => {
  try {
    const email = req.customerUser?.email;
    const phone = req.customerUser?.phone;
    if (!email && !phone) {
      return res.status(200).json({ success: true, orders: [] });
    }

    const query = [];
    if (email) query.push({ email: email.toLowerCase().trim() });
    if (phone) query.push({ phone: phone.trim() });

    // Find admin Customer document by email or phone
    const customerObj = await Customer.findOne({ $or: query });
    if (!customerObj) {
      return res.status(200).json({ success: true, orders: [] });
    }

    const orders = await Order.find({ customer: customerObj._id })
      .populate("items.product", "_id name slug images")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("[customerOrders] getCustomerOrders error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
};

/**
 * POST /api/customer/orders
 * Creates a new order for the customer.
 * Fixes: AUD-001 (backend price recalculation), AUD-004 (atomic stock & rollback), AUD-020 (phone auth support), AUD-023 (email dispatch), AUD-024 (secure order numbers), AUD-014 (sync CustomerUser & Customer).
 */
export const placeCustomerOrder = async (req, res) => {
  const { items, couponCode, paymentMethod, shippingAddress, notes } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart items are required." });
  }

  if (!shippingAddress) {
    return res.status(400).json({ success: false, message: "Shipping address is required." });
  }

  // Extract contact details — support both email and phone authenticated users (AUD-020)
  const email = req.customerUser?.email || req.body.email || null;
  const phone = req.customerUser?.phone || req.body.phone || shippingAddress.phone || "";
  const name = req.customerUser?.name || req.body.name || (email ? email.split("@")[0] : `Customer-${phone}`);

  if (!email && !phone) {
    return res.status(400).json({ success: false, message: "Either email or phone number is required to place an order." });
  }

  const effectiveEmail = email ? email.toLowerCase().trim() : `${phone.replace(/\D/g, "")}@zaevyul.customer`;

  try {
    // Synchronize Customer and CustomerUser models (AUD-014)
    let customerObj = await Customer.findOne({
      $or: [{ email: effectiveEmail }, ...(phone ? [{ phone: phone.trim() }] : [])],
    });

    if (!customerObj) {
      customerObj = await Customer.create({
        name,
        email: effectiveEmail,
        phone: phone || "",
        city: shippingAddress.city || "",
        country: shippingAddress.country || "India",
        status: "active",
      });
    }

    // Cryptographically secure random order number generation (AUD-024)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const orderNumber = `ZAE-${dateStr}-${randomHex}`;

    // Verify products exist, verify stock, and calculate authoritative subtotal (AUD-001)
    const orderItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const productId = item.product || item._id;
      const prod = await Product.findById(productId);
      if (!prod) {
        return res.status(400).json({ success: false, message: `Product not found: ${item.name || productId}` });
      }

      const qty = Math.max(1, parseInt(item.qty || item.quantity || 1, 10));
      if (prod.quantity < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${prod.name} (Available: ${prod.quantity})`,
        });
      }

      const unitPrice = prod.discountPrice > 0 && prod.discountPrice < prod.basePrice
        ? prod.discountPrice
        : prod.basePrice;

      calculatedSubtotal += unitPrice * qty;
      orderItems.push({
        product: prod._id,
        name: prod.name,
        qty: qty,
        price: unitPrice,
      });
    }

    // Authoritative Coupon Validation (AUD-001, AUD-012)
    let calculatedDiscount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim(), active: true });
      if (coupon) {
        const expiresAt = coupon.expiresAt || coupon.expiry;
        const minOrderAmount = coupon.minOrderAmount ?? coupon.minOrderValue ?? 0;
        const discountType = coupon.discountType || coupon.type;
        const discountValue = coupon.discountValue ?? coupon.value ?? 0;
        const maxDiscountAmount = coupon.maxDiscountAmount ?? null;
        const isNotExpired = !expiresAt || new Date(expiresAt) > new Date();
        const meetsMinAmount = !minOrderAmount || calculatedSubtotal >= minOrderAmount;
        if (isNotExpired && meetsMinAmount) {
          if (discountType === "percentage") {
            calculatedDiscount = Math.round((calculatedSubtotal * discountValue) / 100);
            if (maxDiscountAmount && calculatedDiscount > maxDiscountAmount) {
              calculatedDiscount = maxDiscountAmount;
            }
          } else {
            calculatedDiscount = discountValue;
          }
          calculatedDiscount = Math.min(calculatedDiscount, calculatedSubtotal);
          // Increment coupon usage count
          await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
        }
      }
    }

    // Authoritative Shipping Fee Calculation from Settings
    let storeSettings = await Settings.findOne();
    const freeShippingThreshold = storeSettings?.freeShippingThreshold || 5000;
    const standardShippingFee = storeSettings?.standardShippingFee || 250;
    const calculatedShipping = calculatedSubtotal >= freeShippingThreshold ? 0 : standardShippingFee;

    const calculatedTotal = Math.max(0, calculatedSubtotal + calculatedShipping - calculatedDiscount);

    // Atomic Stock Decrement & Transaction Rollback handling (AUD-004)
    const decrementedItems = [];
    for (const item of orderItems) {
      const updatedProd = await Product.findOneAndUpdate(
        { _id: item.product, quantity: { $gte: item.qty } },
        { $inc: { quantity: -item.qty } },
        { new: true }
      );

      if (!updatedProd) {
        // Stock check failed concurrently — rollback all previously decremented items!
        for (const rolled of decrementedItems) {
          await Product.findByIdAndUpdate(rolled.product, { $inc: { quantity: rolled.qty } });
        }
        return res.status(400).json({
          success: false,
          message: `Stock ran out for item: ${item.name}. Please try again.`,
        });
      }
      decrementedItems.push(item);
    }

    // Create Order Document with authoritative backend calculations (AUD-001)
    let newOrder;
    try {
      newOrder = await Order.create({
        orderNumber,
        customer: customerObj._id,
        customerName: name,
        status: "pending",
        items: orderItems,
        subtotal: calculatedSubtotal,
        shipping: calculatedShipping,
        discount: calculatedDiscount,
        total: calculatedTotal,
        paymentMethod: paymentMethod || "UPI",
        paymentStatus: "pending",
        shippingAddress: {
          line1: shippingAddress.line1 || shippingAddress.address || "",
          city: shippingAddress.city || "",
          country: shippingAddress.country || "India",
          zip: shippingAddress.zip || shippingAddress.postalCode || "",
        },
        notes: notes || "",
      });
    } catch (orderError) {
      // Rollback stock decrements if order creation fails! (AUD-004)
      for (const rolled of decrementedItems) {
        await Product.findByIdAndUpdate(rolled.product, { $inc: { quantity: rolled.qty } });
      }
      throw orderError;
    }

    // Update customer statistics
    const customerOrders = await Order.find({ customer: customerObj._id, status: "delivered" });
    customerObj.orderCount = customerOrders.length;
    customerObj.totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
    customerObj.avgOrderValue = customerObj.orderCount > 0 ? Math.round(customerObj.totalSpent / customerObj.orderCount) : 0;
    customerObj.lastOrder = newOrder.createdAt;
    await customerObj.save();

    // Dispatch order confirmation email asynchronously (AUD-023)
    if (email && !email.endsWith("@zaevyul.customer")) {
      sendOrderConfirmationEmail(newOrder, email).catch((err) =>
        console.error("[customerOrders] Email dispatch error:", err)
      );
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order: newOrder,
    });
  } catch (error) {
    console.error("[customerOrders] placeCustomerOrder error:", error);
    return res.status(500).json({ success: false, message: "Failed to place order." });
  }
};

/**
 * POST /api/customer/orders/:id/cancel
 * Allows customers to cancel pending orders (AUD-026).
 */
export const cancelCustomerOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is currently ${order.status}.`,
      });
    }

    order.status = "cancelled";
    await order.save();

    // Restock product quantities
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { quantity: item.qty } });
    }

    return res.status(200).json({
      success: true,
      message: "Order has been cancelled successfully.",
      order,
    });
  } catch (error) {
    console.error("[customerOrders] cancelCustomerOrder error:", error);
    return res.status(500).json({ success: false, message: "Failed to cancel order." });
  }
};
