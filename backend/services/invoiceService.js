import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import Order from "../model/Order.js";
import Invoice from "../model/Invoice.js";
import Settings from "../model/Settings.js";
import Product from "../model/Product.js";
import { getNextSequence } from "../model/Counter.js";

const STORAGE_BASE_DIR = path.join(process.cwd(), "storage", "invoices");

/**
 * Format currency helper for PDF generation
 */
const formatPDFPrice = (amount, symbol = "₹") => {
  const num = Number(amount || 0);
  return `${symbol}${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Render the invoice PDF document onto a file stream using PDFKit.
 */
const buildPDFFile = (invoiceData, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40, bufferPages: true });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const { snapshot, invoiceNumber } = invoiceData;
      const { seller, customer, order, items, totals } = snapshot;
      const symbol = totals.currencySymbol || "₹";

      // Color Palette - Matching Zaevyul Brand
      const primaryColor = "#1C1916"; // Dark Charcoal
      const accentColor = "#B58A5B";  // Warm Gold / Bronze
      const textMuted = "#6B6560";    // Warm Gray
      const lightBg = "#FAF8F5";      // Off-white / Cream
      const borderColor = "#E6DED4";  // Soft Tan Border

      // ── Header Section ────────────────────────────────────────────────────────
      doc
        .fillColor(primaryColor)
        .fontSize(24)
        .font("Helvetica-Bold")
        .text((seller.storeName || "ZAEVYUL").toUpperCase(), 40, 40, { characterSpacing: 2 });

      doc
        .fontSize(8)
        .font("Helvetica-Oblique")
        .fillColor(accentColor)
        .text(seller.tagline || "Timeless · Authentic · Handcrafted", 40, 68);

      // Seller Contact Right-Aligned
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(textMuted)
        .text(seller.address || "Srinagar, J&K, 190001", 300, 40, { align: "right", width: 255 })
        .text(`Email: ${seller.email || "hello@zaevyul.com"}`, 300, 52, { align: "right", width: 255 })
        .text(`Phone: ${seller.phone || "+91 194 123 4567"}`, 300, 64, { align: "right", width: 255 })
        .text(`GSTIN: ${seller.gstin || "22AAAAA0000A1Z5"}`, 300, 76, { align: "right", width: 255 });

      // Divider Line
      doc.moveTo(40, 95).lineTo(555, 95).strokeColor(borderColor).lineWidth(1).stroke();

      // ── Invoice Meta Bar ──────────────────────────────────────────────────────
      doc.rect(40, 105, 515, 36).fill(lightBg).strokeColor(borderColor).stroke();

      doc
        .fillColor(primaryColor)
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("TAX INVOICE", 52, 117);

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text(`Invoice No: `, 240, 117, { continued: true })
        .font("Helvetica")
        .text(invoiceNumber)
        .font("Helvetica-Bold")
        .text(`Date: `, 380, 117, { continued: true })
        .font("Helvetica")
        .text(new Date(order.invoiceDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }));

      // ── Customer & Order Details (Two Columns) ──────────────────────────────
      const colTop = 150;

      // Bill To Column
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(accentColor)
        .text("BILLED TO", 40, colTop);

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(primaryColor)
        .text(customer.name || "Customer", 40, colTop + 14);

      const shipAddr = customer.shippingAddress || {};
      const addrLines = [
        shipAddr.line1,
        shipAddr.line2,
        `${shipAddr.city || ""}, ${shipAddr.state || ""} ${shipAddr.zip || ""}`.trim(),
        shipAddr.country || "India",
        shipAddr.phone ? `Phone: ${shipAddr.phone}` : customer.phone ? `Phone: ${customer.phone}` : "",
        customer.email ? `Email: ${customer.email}` : "",
      ].filter(Boolean);

      let lineY = colTop + 28;
      doc.font("Helvetica").fontSize(8.5).fillColor(textMuted);
      addrLines.forEach((line) => {
        doc.text(line, 40, lineY, { width: 230 });
        lineY += 12;
      });

      // Order Info Column (Right)
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(accentColor)
        .text("ORDER SUMMARY", 320, colTop);

      let orderY = colTop + 14;
      const orderDetails = [
        { label: "Order ID:", val: `#${order.orderId}` },
        { label: "Order Date:", val: new Date(order.orderDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
        { label: "Payment Method:", val: order.paymentMethod || "Online" },
        { label: "Payment Status:", val: (order.paymentStatus || "Paid").toUpperCase() },
      ];

      doc.fontSize(8.5);
      orderDetails.forEach((item) => {
        doc
          .font("Helvetica-Bold")
          .fillColor(primaryColor)
          .text(item.label, 320, orderY, { width: 90 })
          .font("Helvetica")
          .fillColor(textMuted)
          .text(item.val, 410, orderY, { width: 145 });
        orderY += 14;
      });

      // ── Products Table ────────────────────────────────────────────────────────
      const tableTop = Math.max(lineY + 15, orderY + 15, 235);

      // Table Headers
      doc.rect(40, tableTop, 515, 22).fill(primaryColor);

      doc
        .fillColor("#FFFFFF")
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .text("#", 45, tableTop + 6, { width: 20 })
        .text("ITEM DESCRIPTION", 70, tableTop + 6, { width: 200 })
        .text("SKU / VARIANT", 275, tableTop + 6, { width: 85 })
        .text("QTY", 365, tableTop + 6, { width: 35, align: "center" })
        .text("UNIT PRICE", 405, tableTop + 6, { width: 70, align: "right" })
        .text("TOTAL", 480, tableTop + 6, { width: 70, align: "right" });

      let currentY = tableTop + 22;

      // Table Rows
      items.forEach((item, index) => {
        // Page Break Check
        if (currentY > 720) {
          doc.addPage();
          currentY = 40;
        }

        const isEven = index % 2 === 0;
        if (isEven) {
          doc.rect(40, currentY, 515, 24).fill(lightBg);
        }

        const variantInfo = [item.sku, item.size ? `Size: ${item.size}` : "", item.color ? `Color: ${item.color}` : ""]
          .filter(Boolean)
          .join(" / ");

        doc
          .fillColor(primaryColor)
          .font("Helvetica")
          .fontSize(8.5)
          .text(`${index + 1}`, 45, currentY + 7, { width: 20 })
          .font("Helvetica-Bold")
          .text(item.name, 70, currentY + 7, { width: 200, height: 14, ellipsis: true })
          .font("Helvetica")
          .fillColor(textMuted)
          .text(variantInfo || "-", 275, currentY + 7, { width: 85, height: 14, ellipsis: true })
          .fillColor(primaryColor)
          .text(`${item.qty}`, 365, currentY + 7, { width: 35, align: "center" })
          .text(formatPDFPrice(item.unitPrice, symbol), 405, currentY + 7, { width: 70, align: "right" })
          .font("Helvetica-Bold")
          .text(formatPDFPrice(item.lineTotal, symbol), 480, currentY + 7, { width: 70, align: "right" });

        currentY += 24;
      });

      doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor(borderColor).lineWidth(1).stroke();
      currentY += 10;

      // ── Totals Summary Block ─────────────────────────────────────────────────
      if (currentY > 680) {
        doc.addPage();
        currentY = 40;
      }

      const summaryLeft = 340;
      const summaryWidth = 215;

      const totalsRows = [
        { label: "Subtotal:", val: formatPDFPrice(totals.subtotal, symbol) },
        ...(totals.discount > 0 ? [{ label: "Discount:", val: `-${formatPDFPrice(totals.discount, symbol)}` }] : []),
        { label: "Shipping:", val: totals.shipping === 0 ? "FREE" : formatPDFPrice(totals.shipping, symbol) },
        { label: "Tax / GST:", val: formatPDFPrice(totals.tax, symbol) },
      ];

      doc.fontSize(8.5);
      totalsRows.forEach((row) => {
        doc
          .font("Helvetica")
          .fillColor(textMuted)
          .text(row.label, summaryLeft, currentY, { width: 100, align: "left" })
          .font("Helvetica-Bold")
          .fillColor(primaryColor)
          .text(row.val, summaryLeft + 100, currentY, { width: 115, align: "right" });
        currentY += 16;
      });

      // Grand Total Box
      currentY += 4;
      doc.rect(summaryLeft - 5, currentY - 2, summaryWidth + 5, 26).fill(primaryColor);

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#FFFFFF")
        .text("TOTAL AMOUNT:", summaryLeft, currentY + 6, { width: 110, align: "left" })
        .text(formatPDFPrice(totals.grandTotal, symbol), summaryLeft + 100, currentY + 6, { width: 115, align: "right" });

      currentY += 40;

      // ── Footer & Disclaimers ──────────────────────────────────────────────────
      if (currentY > 740) {
        doc.addPage();
        currentY = 40;
      }

      doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor(borderColor).lineWidth(1).stroke();

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(textMuted)
        .text("Thank you for your purchase from Zaevyul.", 40, currentY + 10, { align: "center", width: 515 })
        .text("This is a computer-generated tax invoice. No signature is required.", 40, currentY + 22, { align: "center", width: 515 });

      doc.end();

      stream.on("finish", () => resolve(filePath));
      stream.on("error", (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Generate PDF Invoice for an Order.
 * Idempotent: returns existing invoice if already generated.
 */
export const generateInvoiceForOrder = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate("customer");
    if (!order) {
      throw new Error(`Order not found for ID: ${orderId}`);
    }

    // Idempotency check: Return existing invoice if already successfully generated
    const existingInvoice = await Invoice.findOne({ order: order._id, status: "generated" });
    if (existingInvoice && existingInvoice.pdfPath && fs.existsSync(existingInvoice.pdfPath)) {
      return existingInvoice;
    }

    // Fetch store settings for seller metadata
    const settings = await Settings.findOne() || {};

    const year = new Date().getFullYear();
    const counterName = `invoice_${year}`;
    const seq = await getNextSequence(counterName);
    const invoiceNumber = `INV-${year}-${String(seq).padStart(6, "0")}`;

    // Itemized products preparation
    const itemSnapshots = [];
    for (const item of order.items) {
      let sku = "";
      if (item.product) {
        const prod = typeof item.product === "object" && item.product.sku
          ? item.product
          : await Product.findById(item.product).select("sku");
        if (prod) sku = prod.sku || "";
      }

      const unitPrice = item.price || 0;
      const qty = item.qty || 1;
      const lineTotal = unitPrice * qty;

      itemSnapshots.push({
        product: item.product,
        name: item.name || "Product",
        sku,
        size: item.size || "",
        color: item.color || "",
        qty,
        unitPrice,
        discount: 0,
        taxRate: order.taxRate || 0,
        taxAmount: Math.round(((order.taxAmount || 0) / (order.items.length || 1))),
        lineTotal,
      });
    }

    // Assemble Data Snapshot
    const snapshot = {
      seller: {
        storeName: settings.storeName || "Zaevyul",
        tagline: settings.tagline || "Timeless · Authentic · Handcrafted",
        email: settings.email || "hello@zaevyul.com",
        phone: settings.phone || "+91 194 123 4567",
        address: settings.address || "Residency Road, Srinagar, Jammu & Kashmir 190001",
        gstin: settings.gstin || "22AAAAA0000A1Z5",
        currencySymbol: settings.currencySymbol || "₹",
        currency: settings.currency || "INR",
      },
      customer: {
        name: order.customerName || (order.customer && order.customer.name) || "Valued Customer",
        email: (order.customer && order.customer.email) || "",
        phone: (order.customer && order.customer.phone) || order.shippingAddress?.phone || "",
        shippingAddress: {
          recipientName: order.shippingAddress?.recipientName || order.customerName || "",
          line1: order.shippingAddress?.line1 || "",
          line2: order.shippingAddress?.line2 || "",
          city: order.shippingAddress?.city || "",
          state: order.shippingAddress?.state || "",
          country: order.shippingAddress?.country || "India",
          zip: order.shippingAddress?.zip || "",
          phone: order.shippingAddress?.phone || "",
        },
        billingAddress: {
          recipientName: order.shippingAddress?.recipientName || order.customerName || "",
          line1: order.shippingAddress?.line1 || "",
          line2: order.shippingAddress?.line2 || "",
          city: order.shippingAddress?.city || "",
          state: order.shippingAddress?.state || "",
          country: order.shippingAddress?.country || "India",
          zip: order.shippingAddress?.zip || "",
          phone: order.shippingAddress?.phone || "",
        },
      },
      order: {
        orderId: order.orderNumber,
        orderDate: order.createdAt,
        invoiceDate: new Date(),
        paymentMethod: order.paymentMethod || "Online",
        paymentStatus: order.paymentStatus || "paid",
      },
      items: itemSnapshots,
      totals: {
        subtotal: order.subtotal || 0,
        discount: order.discount || 0,
        shipping: order.shipping || 0,
        tax: order.taxAmount || 0,
        grandTotal: order.total || 0,
        currency: order.currency || "INR",
        currencySymbol: settings.currencySymbol || "₹",
      },
    };

    // Ensure output directory exists
    const yearDir = path.join(STORAGE_BASE_DIR, String(year));
    if (!fs.existsSync(yearDir)) {
      fs.mkdirSync(yearDir, { recursive: true });
    }

    const filePath = path.join(yearDir, `${invoiceNumber}.pdf`);

    // Render PDF Document
    await buildPDFFile({ snapshot, invoiceNumber }, filePath);

    // Persist Invoice document
    const invoiceDoc = await Invoice.create({
      order: order._id,
      orderNumber: order.orderNumber,
      invoiceNumber,
      sequenceNumber: seq,
      year,
      snapshot,
      pdfPath: filePath,
      status: "generated",
      generatedAt: new Date(),
    });

    // Update Order reference
    order.invoice = {
      invoiceNumber,
      invoiceId: invoiceDoc._id,
      generatedAt: invoiceDoc.generatedAt,
      pdfUrl: `/api/customer/orders/${order._id}/invoice`,
      status: "generated",
    };
    await order.save();

    console.log(`[InvoiceService] Invoice ${invoiceNumber} generated successfully for Order #${order.orderNumber}`);
    return invoiceDoc;
  } catch (error) {
    console.error(`[InvoiceService] Error generating invoice for Order ID ${orderId}:`, error);

    // Update Order invoice status to 'failed' without breaking order lifecycle
    try {
      await Order.findByIdAndUpdate(orderId, {
        "invoice.status": "failed",
      });
    } catch (e) {
      /* ignore */
    }

    throw error;
  }
};

/**
 * Retrieve invoice file path for an order, regenerating if file is missing.
 */
export const getInvoicePDFPath = async (orderId) => {
  let invoiceDoc = await Invoice.findOne({ order: orderId, status: "generated" });
  
  if (!invoiceDoc || !invoiceDoc.pdfPath || !fs.existsSync(invoiceDoc.pdfPath)) {
    // Regenerate invoice if missing
    invoiceDoc = await generateInvoiceForOrder(orderId);
  }

  if (!invoiceDoc || !invoiceDoc.pdfPath || !fs.existsSync(invoiceDoc.pdfPath)) {
    throw new Error("Invoice PDF file not available.");
  }

  return { filePath: invoiceDoc.pdfPath, invoiceNumber: invoiceDoc.invoiceNumber };
};
