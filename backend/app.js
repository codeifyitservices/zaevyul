import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "./config/env.js";
import "./config/db.js";

// Import Routes
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import orderRoutes from "./routes/orders.js";
import customerRoutes from "./routes/customers.js";
import blogRoutes from "./routes/blogs.js";
import couponRoutes from "./routes/coupons.js";
import newsletterRoutes from "./routes/newsletter.js";
import reportsRoutes from "./routes/reports.js";
import settingsRoutes from "./routes/settings.js";
import profileRoutes from "./routes/profile.js";

const PORT = 5000;
const app = express();

// Middleware
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

// Route registration
app.use("/api/admin/auth", authRoutes);
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use("/api/admin/customers", customerRoutes);
app.use("/api/admin/blogs", blogRoutes);
app.use("/api/admin/coupons", couponRoutes);
app.use("/api/admin/newsletter", newsletterRoutes);
app.use("/api/admin/reports", reportsRoutes);
app.use("/api/admin/settings", settingsRoutes);
app.use("/api/admin/profile", profileRoutes);

// Health check endpoint (fixed: parameters were swapped in original)
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
