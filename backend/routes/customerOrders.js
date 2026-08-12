import express from "express";
import {
  requireCustomerAuth,
  optionalCustomerAuth,
} from "../middleware/customerAuth.js";
import {
  getCustomerOrders,
  placeCustomerOrder,
  cancelCustomerOrder,
  calculateTaxForCart,
} from "../controllers/customerOrders.js";

const router = express.Router();

// Customer order routes — require requireCustomerAuth
router.get("/", requireCustomerAuth, getCustomerOrders);
router.post("/", requireCustomerAuth, placeCustomerOrder);
router.post("/calculate-tax", optionalCustomerAuth, calculateTaxForCart);
router.post("/:id/cancel", requireCustomerAuth, cancelCustomerOrder);

export default router;
