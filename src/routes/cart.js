const express = require("express");
const router = express.Router();

const {
  getCarts,
  newCart,
  updateCart,
  deleteCart,
} = require("../controllers/cartController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.route("/carts").get(getCarts);

router.route("/admin/cart/new").post(isAuthenticatedUser, newCart);

router
  .route("/cart/:id")
  .put(isAuthenticatedUser, updateCart)
  .delete(isAuthenticatedUser, deleteCart);

module.exports = router;
