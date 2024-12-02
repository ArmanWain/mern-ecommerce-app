import express from "express";
import {
  allUsers,
  deleteUser,
  forgotPassword,
  getUserDetails,
  getUserProfile,
  loginUser,
  logout,
  registerUser,
  resetPassword,
  updatePassword,
  updateProfile,
  updateUser,
  uploadAvatar,
} from "../controllers/authControllers.js";
const router = express.Router();

import { verifyJWT } from "../middleware/verifyJWT.js";
import { verifyRoles } from "../middleware/verifyRoles.js";

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);

router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);

router.route("/me").get(verifyJWT, getUserProfile);
router.route("/me/update").put(verifyJWT, updateProfile);
router.route("/password/update").put(verifyJWT, updatePassword);
router.route("/me/upload_avatar").put(verifyJWT, uploadAvatar);

router
  .route("/admin/users")
  .get(verifyJWT, verifyRoles("admin"), allUsers);

router
  .route("/admin/users/:id")
  .get(verifyJWT, verifyRoles("admin"), getUserDetails)
  .put(verifyJWT, verifyRoles("admin"), updateUser)
  .delete(verifyJWT, verifyRoles("admin"), deleteUser);

export default router;
