const Cart = require("../models/cart");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");

// Add to cart  =>   /api/v1/cart/new
exports.newCart = catchAsyncErrors(async (req, res, next) => {
  const cart = await Cart.create(req.body);

  res.status(200).json({
    success: true,
    cart,
  });
});

// Get cart   =>   /api/v1/cart/
exports.getCarts = catchAsyncErrors(async (req, res, next) => {
  try {
    const apiFeatures = await Cart.find({}).select("user");

    const carts = await apiFeatures.query;

    res.status(200).json({
      success: true,
      carts,
    });
  } catch (error) {
    return res.status(400).json(error);
  }
});

// Update Cart   =>   /api/v1/admin/cart/:userid
exports.updateCart = catchAsyncErrors(async (req, res, next) => {
  try {
    let cart = await Cart.Cart.find({}).select("user");

    if (!cart) {
      return next(new ErrorHandler("Cart not found", 404));
    }

    cart = await Cart.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    return res.status(400).json(error);
  }
});

// Delete Cart   =>   /api/v1/cart/:id
exports.deleteCart = catchAsyncErrors(async (req, res, next) => {
  try {
    const cart = await Cart.findById(req.params.id);

    if (!cart) {
      return next(new ErrorHandler("Cart not found", 404));
    }

    await cart.remove();

    res.status(200).json({
      success: true,
      message: "Cart is deleted.",
    });
  } catch (error) {
    return res.status(400).json(error);
  }
});
