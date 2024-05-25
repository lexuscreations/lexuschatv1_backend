import express from "express";

import isAuthenticated from "../middleware/isAuthenticated.js";
import {
  login,
  logout,
  register,
  searchUsers,
  getConversationalUsersHandler,
} from "../controllers/userController.js";

const router = express.Router();

router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/register").post(register);
router.route("/search").get(isAuthenticated, searchUsers);
router
  .route("/conversational_users")
  .get(isAuthenticated, getConversationalUsersHandler);

export default router;
