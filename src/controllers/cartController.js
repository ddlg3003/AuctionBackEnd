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

// Get all carts   =>   /api/v1/cart/:userid
exports.getCarts = catchAsyncErrors(async (req, res, next) => {
  try {
    const resPerPage = 4;
    const cartsCount = await Cart.countDocuments();

    const apiFeatures = new APIFeatures(Cart.find({}).select("user"), req.query)

    let carts = await apiFeatures.query;
    let filteredCartsCount = carts.length;

    apiFeatures.pagination(resPerPage);
    carts = await apiFeatures.query;

    res.status(200).json({
      success: true,
      cartsCount,
      resPerPage,
      filteredCartsCount,
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
