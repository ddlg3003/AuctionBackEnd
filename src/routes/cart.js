const express = require("express");
const router = express.Router();

const {
  getCarts,
  newCart,
  updateCart,
  deleteCart,
} = require("../controllers/cartController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router
  .route("/carts")
  .get(isAuthenticatedUser, authorizeRoles("admin", "user"), getCarts);

router.route("/cart/new").post(isAuthenticatedUser, newCart);

router.route("/cart").delete(isAuthenticatedUser, deleteCart);

module.exports = router;
