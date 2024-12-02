import express from "express";
const router = express.Router();

import { verifyJWT } from "../middleware/verifyJWT.js";
import { stripeCheckoutSession, stripeWebhook } from "../controllers/paymentControllers.js";

router.route("/payment/checkout_session")
  .post(verifyJWT, stripeCheckoutSession);

router.route("/payment/webhook").post(stripeWebhook);
export default router;
