const express = require("express");
const router = express.Router();

const {
  getCarts,
  newCart,
  deleteCart,
  getCartById,
} = require("../controllers/cartController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router
  .route("/carts")
  .get(isAuthenticatedUser, authorizeRoles("admin", "user"), getCarts);

router
  .route("/cart/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin", "user"), getCartById);

router.route("/cart/new").post(isAuthenticatedUser, newCart);

router.route("/cart/:id").delete(isAuthenticatedUser, deleteCart);

module.exports = router;
