import Product from "../model/Product.js";
import Category from "../model/Category.js";
import Blog from "../model/Blog.js";
import BlogCategory from "../model/BlogCategory.js";
import Coupon from "../model/Coupon.js";
import Newsletter from "../model/Newsletter.js";
import Settings from "../model/Settings.js";

// Helper to escape regex inputs safely (AUD-021)
export const escapeRegex = (str) => {
  if (!str) return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const visibleProductFilter = {
  $or: [
    { status: "published" },
    { status: null },
    { status: { $exists: false } },
  ],
};

/**
 * GET /api/public/products
 * Fetch active/published products with optional filtering.
 */
export const getPublicProducts = async (req, res) => {
  const { search, category, featured, limit, page = 1 } = req.query;
  try {
    const filter = { ...visibleProductFilter };

    if (category && category !== "ALL" && category !== "all") {
      // Find category by slug or id
      const catObj = await Category.findOne({
        $or: [{ slug: category }, { name: { $regex: escapeRegex(category), $options: "i" } }],
      });
      if (catObj) {
        filter.category = catObj._id;
      }
    }

    if (featured === "true") {
      filter.featured = true;
    }

    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { tags: { $regex: safeSearch, $options: "i" } },
        { material: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = parseInt(limit, 10) || 0; // 0 means no limit (all)

    let query = Product.find(filter)
      .populate("category", "name slug")
      .sort({ featuredOrder: 1, createdAt: -1 });

    if (limitNum > 0) {
      query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const [products, totalCount] = await Promise.all([
      query,
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      products,
      totalCount,
      page: pageNum,
      totalPages: limitNum > 0 ? Math.ceil(totalCount / limitNum) : 1,
    });
  } catch (error) {
    console.error("[public] getPublicProducts error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch products." });
  }
};

/**
 * GET /api/public/products/:identifier (id or slug)
 */
export const getPublicProductBySlug = async (req, res) => {
  const { identifier } = req.params;
  try {
    let product;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findOne({ _id: identifier, ...visibleProductFilter }).populate("category", "name slug");
    }
    if (!product) {
      product = await Product.findOne({ slug: identifier, ...visibleProductFilter }).populate("category", "name slug");
    }

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("[public] getPublicProductBySlug error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch product." });
  }
};

/**
 * GET /api/public/categories
 * Fixed AUD-018: N+1 query resolved via single MongoDB $lookup/$group aggregation pipeline.
 */
export const getPublicCategories = async (req, res) => {
  try {
    const categoriesWithCount = await Category.aggregate([
      { $sort: { sortOrder: 1, name: 1 } },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "category",
          pipeline: [{ $match: visibleProductFilter }],
          as: "matchedProducts",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          description: 1,
          mainImage: 1,
          featured: 1,
          featuredOrder: 1,
          sortOrder: 1,
          productCount: { $size: "$matchedProducts" },
        },
      },
    ]);

    return res.status(200).json({ success: true, categories: categoriesWithCount });
  } catch (error) {
    console.error("[public] getPublicCategories error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch categories." });
  }
};

/**
 * GET /api/public/blogs
 */
export const getPublicBlogsList = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "published" }).sort({ publishedAt: -1, createdAt: -1 });
    return res.status(200).json({ success: true, blogs });
  } catch (error) {
    console.error("[public] getPublicBlogsList error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch journal articles." });
  }
};

/**
 * GET /api/public/blogs/:slug (AUD-019)
 */
export const getPublicBlogBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    let blog = await Blog.findOne({ slug, status: "published" });
    if (!blog && slug.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(slug);
    }

    if (!blog) {
      return res.status(404).json({ success: false, message: "Article not found." });
    }

    return res.status(200).json({ success: true, blog });
  } catch (error) {
    console.error("[public] getPublicBlogBySlug error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch article." });
  }
};

/**
 * GET /api/public/blog-categories
 */
export const getPublicBlogCategories = async (req, res) => {
  try {
    const categories = await BlogCategory.find().sort({ name: 1 });
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("[public] getPublicBlogCategories error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch blog categories." });
  }
};

/**
 * GET /api/public/coupons
 * Returns all active, non-expired coupons for display in the storefront coupon picker.
 * Only exposes code, type, value, description, minOrderValue — no usage counts.
 */
export const getPublicCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      active: true,
      $or: [{ expiry: null }, { expiry: { $gt: now } }],
    }).select("code type value description minOrderValue").sort({ minOrderValue: 1, createdAt: -1 });

    return res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.error("[public] getPublicCoupons error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch coupons." });
  }
};

/**
 * POST /api/public/coupons/validate (AUD-012)
 */
export const validatePublicCoupon = async (req, res) => {
  const { code, cartSubtotal } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: "Coupon code is required." });
  }

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), active: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid or inactive coupon code." });
    }

    const expiresAt = coupon.expiresAt || coupon.expiry;
    const usageCount = coupon.usageCount ?? coupon.usedCount ?? 0;
    const minOrderAmount = coupon.minOrderAmount ?? coupon.minOrderValue ?? 0;
    const discountType = coupon.discountType || coupon.type;
    const discountValue = coupon.discountValue ?? coupon.value ?? 0;
    const maxDiscountAmount = coupon.maxDiscountAmount ?? null;

    if (expiresAt && new Date(expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: "Coupon code has expired." });
    }

    if (coupon.usageLimit && usageCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: "Coupon code limit reached." });
    }

    const subtotal = Number(cartSubtotal) || 0;
    if (minOrderAmount && subtotal < minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${minOrderAmount} required for this coupon.`,
      });
    }

    let discountAmount = 0;
    if (discountType === "percentage") {
      discountAmount = Math.round((subtotal * discountValue) / 100);
      if (maxDiscountAmount && discountAmount > maxDiscountAmount) {
        discountAmount = maxDiscountAmount;
      }
    } else {
      discountAmount = discountValue;
    }
    discountAmount = Math.min(discountAmount, subtotal);

    return res.status(200).json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType,
        discountValue,
        discountAmount,
      },
    });
  } catch (error) {
    console.error("[public] validatePublicCoupon error:", error);
    return res.status(500).json({ success: false, message: "Failed to validate coupon." });
  }
};

/**
 * POST /api/public/newsletter/subscribe (AUD-013)
 */
export const subscribeNewsletter = async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Please enter a valid email address." });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    let sub = await Newsletter.findOne({ email: normalizedEmail });
    if (!sub) {
      sub = await Newsletter.create({ email: normalizedEmail, status: "subscribed" });
    } else if (sub.status !== "subscribed") {
      sub.status = "subscribed";
      await sub.save();
    }

    return res.status(200).json({
      success: true,
      message: "Thank you for subscribing to Zaevyul Journal updates!",
    });
  } catch (error) {
    console.error("[public] subscribeNewsletter error:", error);
    return res.status(500).json({ success: false, message: "Failed to subscribe." });
  }
};

/**
 * GET /api/public/settings (AUD-008)
 * Returns public shop configuration (currencies, public gateway keys, shipping thresholds).
 */
export const getPublicSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
      await settings.save();
    }

    const publicSettings = {
      storeName: settings.storeName || "Zaevyul",
      storeEmail: settings.storeEmail || "concierge@zaevyul.com",
      freeShippingThreshold: settings.freeShippingThreshold || 5000,
      standardShippingFee: settings.standardShippingFee || 250,
      lowStockThreshold: settings.lowStockThreshold || 5,
      paymentGateways: {
        codEnabled: settings.paymentGateways?.codEnabled ?? true,
        stripeEnabled: settings.paymentGateways?.stripeEnabled ?? true,
        stripePublishableKey: settings.paymentGateways?.stripePublishableKey || "pk_test_sample",
        razorpayEnabled: settings.paymentGateways?.razorpayEnabled ?? true,
        razorpayKeyId: settings.paymentGateways?.razorpayKeyId || "rzp_test_sample",
      },
    };

    return res.status(200).json({ success: true, settings: publicSettings });
  } catch (error) {
    console.error("[public] getPublicSettings error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch settings." });
  }
};
