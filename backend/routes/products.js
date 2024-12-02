import express from "express";
import {
  canUserReview,
  createProductReview,
  deleteProduct,
  deleteProductImage,
  deleteReview,
  getAdminProducts,
  getProductDetails,
  getProductStock,
  getProductReviews,
  getProducts,
  newProduct,
  updateProduct,
  uploadProductImages,
} from "../controllers/productControllers.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
const router = express.Router();

router.route("/products").get(getProducts);
router
  .route("/admin/products")
  .post(verifyJWT, verifyRoles("admin"), newProduct)
  .get(verifyJWT, verifyRoles("admin"), getAdminProducts);

router.route("/products/:id").get(getProductDetails);

router.route("/products/stock/:id").get(getProductStock);

router
  .route("/admin/products/:id/upload_images")
  .put(verifyJWT, verifyRoles("admin"), uploadProductImages);

router
  .route("/admin/products/:id/delete_image")
  .put(verifyJWT, verifyRoles("admin"), deleteProductImage);

router
  .route("/admin/products/:id")
  .put(verifyJWT, verifyRoles("admin"), updateProduct);
router
  .route("/admin/products/:id")
  .delete(verifyJWT, verifyRoles("admin"), deleteProduct);

router
  .route("/reviews")
  .get(verifyJWT, getProductReviews)
  .put(verifyJWT, createProductReview);

router
  .route("/admin/reviews")
  .delete(verifyJWT, verifyRoles("admin"), deleteReview);

router.route("/can_review").get(verifyJWT, canUserReview);

export default router;
