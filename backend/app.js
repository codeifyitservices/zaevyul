import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import "./config/env.js";
import "./config/db.js";

// Import Routes
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import blogCategoryRoutes from "./routes/blogCategories.js";
import orderRoutes from "./routes/orders.js";
import customerRoutes from "./routes/customers.js";
import blogRoutes from "./routes/blogs.js";
import couponRoutes from "./routes/coupons.js";
import newsletterRoutes from "./routes/newsletter.js";
import reportsRoutes from "./routes/reports.js";
import settingsRoutes from "./routes/settings.js";
import profileRoutes from "./routes/profile.js";
import customerAuthRoutes from "./routes/customerAuth.js";
import customerAddressesRoutes from "./routes/customerAddresses.js";
import customerFavoritesRoutes from "./routes/customerFavorites.js";
import customerOrdersRoutes from "./routes/customerOrders.js";
import publicRoutes from "./routes/public.js";

const PORT = 5000;
const app = express();

// ── AUD-022: Rate Limiting ────────────────────────────────────────────────────

/** Strict limiter for OTP / auth endpoints (10 req / 15 min per IP) */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

/** Moderate limiter for customer & admin API (200 req / 15 min per IP) */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://zaevyul.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// ── Public endpoints — accessible without auth headers (AUD-002, AUD-012, AUD-013, AUD-018, AUD-019) ──
app.use("/api/public", apiLimiter, publicRoutes);

// ── Admin auth gets stricter rate limiting (AUD-022) ──────────────────────────
app.use("/api/admin/auth", authLimiter, authRoutes);

// ── Customer auth uses the general API limiter here; OTP/login routes
// define stricter route-level limiters in routes/customerAuth.js.
app.use("/api/customer/auth", apiLimiter, customerAuthRoutes);

// ── Route registration (general API limiter) ──────────────────────────────────
app.use("/api/admin/products", apiLimiter, productRoutes);
app.use("/api/admin/categories", apiLimiter, categoryRoutes);
app.use("/api/admin/blog-categories", apiLimiter, blogCategoryRoutes);
app.use("/api/admin/orders", apiLimiter, orderRoutes);
app.use("/api/admin/customers", apiLimiter, customerRoutes);
app.use("/api/admin/blogs", apiLimiter, blogRoutes);
app.use("/api/admin/coupons", apiLimiter, couponRoutes);
app.use("/api/admin/newsletter", apiLimiter, newsletterRoutes);
app.use("/api/admin/reports", apiLimiter, reportsRoutes);
app.use("/api/admin/settings", apiLimiter, settingsRoutes);
app.use("/api/admin/profile", apiLimiter, profileRoutes);

// ── Customer storefront routes ────────────────────────────────────────────────
app.use("/api/customer/favorites", apiLimiter, customerFavoritesRoutes);
app.use("/api/customer/addresses", apiLimiter, customerAddressesRoutes);
app.use("/api/customer/orders", apiLimiter, customerOrdersRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "server is up and running🎉",
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log("App is running on port:", PORT);
  });
}

export default app;
