import express from "express";
const router = express.Router();

import { verifyJWT } from "../middleware/verifyJWT.js";
import {
  getCheckoutDetails,
  verifyCart,
  canProceedWithCheckout,
  canAddToCart
} from "../controllers/cartControllers.js";

router.route("/cart/checkout_details").post(verifyJWT, getCheckoutDetails);

router.route("/cart/verify").post(verifyCart);

router.route("/cart/can_proceed").post(verifyJWT, canProceedWithCheckout);

router.route("/cart/:id").post(canAddToCart);

export default router;
