const Cart = require("../models/cart");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");

// Add to cart  =>   /api/v1/cart/new
exports.newCart = catchAsyncErrors(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id, product: req.body.product });
    
  if(cart) {
    return next(new ErrorHandler("This product is already in cart", 400));
  }

  cart = await Cart.create(req.body);

  res.status(200).json({
    success: true,
    cart,
  });
});

// Get cart   =>   /api/v1/cart/
exports.getCarts = catchAsyncErrors(async (req, res, next) => {
  try {
    const carts = await Cart.find({ user: req.user._id });

    res.status(200).json({
      success: true,
      carts,
    });
  } catch (error) {
    return res.status(400).json(error);
  }
});

// Get cart by id   =>   /api/v1/cart/:id
exports.getCartById = catchAsyncErrors(async (req, res, next) => {
  try {
    const cart = await Cart.findById(req.params.id);

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
