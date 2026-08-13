import express from "express";
import {
  getPublicProducts,
  getPublicProductBySlug,
  getPublicCategories,
  getPublicBlogsList,
  getPublicBlogBySlug,
  getPublicBlogCategories,
  getPublicCoupons,
  validatePublicCoupon,
  subscribeNewsletter,
  getPublicSettings,
  getPublicLocation,
} from "../controllers/public.js";

const router = express.Router();

// Products & Categories
router.get("/products", getPublicProducts);
router.get("/products/:identifier", getPublicProductBySlug);
router.get("/categories", getPublicCategories);

// Journal / Blogs
router.get("/blogs", getPublicBlogsList);
router.get("/blogs/:slug", getPublicBlogBySlug);
router.get("/blog-categories", getPublicBlogCategories);

// Coupons, Newsletter, Settings, Location
router.get("/coupons", getPublicCoupons);
router.post("/coupons/validate", validatePublicCoupon);
router.post("/newsletter/subscribe", subscribeNewsletter);
router.get("/settings", getPublicSettings);
router.get("/location", getPublicLocation);

export default router;
