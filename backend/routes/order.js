import express from "express";
const router = express.Router();

import { verifyJWT } from "../middleware/verifyJWT.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import {
  allOrders,
  deleteOrder,
  getOrderDetails,
  getSales,
  myOrders,
  newOrder,
  updateOrder,
} from "../controllers/orderControllers.js";

router.route("/orders/new").post(verifyJWT, newOrder);
router.route("/orders/:id").get(verifyJWT, getOrderDetails);
router.route("/me/orders").get(verifyJWT, myOrders);

router
  .route("/admin/get_sales")
  .get(verifyJWT, verifyRoles("admin"), getSales);

router
  .route("/admin/orders")
  .get(verifyJWT, verifyRoles("admin"), allOrders);

router
  .route("/admin/orders/:id")
  .put(verifyJWT, verifyRoles("admin"), updateOrder)
  .delete(verifyJWT, verifyRoles("admin"), deleteOrder);

export default router;
