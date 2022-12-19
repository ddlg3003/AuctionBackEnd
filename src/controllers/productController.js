const Product = require('../models/product');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('cloudinary');
const sendMail = require('../utils/sendEmail');

// Create new product   =>   /api/v1/admin/product/new
exports.newProduct = catchAsyncErrors(async (req, res, next) => {
  let images = [];
  if (typeof req.body.images === 'string') {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  let imagesLinks = [];

  for (const element of images) {
    const result = await cloudinary.v2.uploader.upload(element, {
      folder: 'products',
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user.id;
  req.body.currentPrice = req.body.minPrice;
  req.body.seller = req.user.name;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

// Get all products   =>   /api/v1/products?keyword=apple
exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = parseInt(req.query.limit);
  const productsCount = await Product.countDocuments();

  const apiFeatures = new APIFeatures(Product, req.query)
    .search()
    .filter();

  let products = await apiFeatures.query;
  let filteredProductsCount = products.length;

  apiFeatures.pagination(resPerPage);
  products = await apiFeatures.query;

  res.status(200).json({
    success: true,
    productsCount,
    resPerPage,
    filteredProductsCount,
    products,
  });
});

// Get top 5 products    =>   /api/v1/products/top5
exports.getTop5Products = catchAsyncErrors(async (req, res, next) => {
  //   try {
  const currentDate = Date.now();
  const top5Products = await Product.find({ endTime: { $gte: currentDate } })
    .sort({ endTime: 1 })
    .limit(5);

  res.status(200).json({
    success: true,
    top5Products,
  });
  //   } catch (error) {
  //     res.status(400).json({ success: false, error });
  //   }
});

// Get all products (Admin)  =>   /api/v1/admin/products
exports.getUserProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    products,
  });
});

// Get single product details   =>   /api/v1/product/:id
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate(
    'priceHolder',
    'lastName firstName'
  );

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// Update Product   =>   /api/v1/admin/product/:id
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  if (req.user.id !== product.user.toString() && req.user.role !== 'admin') {
    return next(
      new ErrorHandler(
        'You are not authorized to make change to this product',
        401
      )
    );
  }

  let images = [];
  if (typeof req.body.images === 'string') {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    // Deleting images associated with the product
    for (const element of product.images) {
      const result = await cloudinary.v2.uploader.destroy(element.public_id);
    }

    let imagesLinks = [];

    for (const element of images) {
      const result = await cloudinary.v2.uploader.upload(element, {
        folder: 'products',
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }

  const { currentPrice, auctionLogs, priceHolder, ratings, reviews, ...updatedData } = req.body;

  product = await Product.findByIdAndUpdate(req.params.id, updatedData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

// Bid price for a product   =>   /api/v1/product/:id/bid
exports.bidProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  const { bidPrice } = req.body;

  // Check if expired time or not
  if (product.endTime - Date.now() > 0) {
    // Check if bid price is a positive interger number and bid >= current price + step
    // Js auto convert string to number because absolute comparing
    if (bidPrice >= product.currentPrice + product.step) {
      const auctionLog = {
        user: req.user._id,
        bidPrice,
      };
      // Update product
      product = await Product.findByIdAndUpdate(
        req.params.id,
        {
          currentPrice: bidPrice,
          priceHolder: req.user._id,
          auctionLogs: [...product.auctionLogs, auctionLog],
        },
        {
          new: true,
          runValidators: true,
          useFindAndModify: false,
        }
      );

      const message = `
        <div>
          You've bid $${bidPrice} for ${product.name}. 
          See detail at: ${process.env.FRONTEND_URL}/products/${req.params.id}
        </div>
      `;

      // Send mail to user by using sendGrid
      await sendMail({
        email: req.user.email,
        subject: `CDC Auction Bidding Notification for ${product.name}`,
        message,
      });
    } else {
      return next(
        new ErrorHandler(
          'Bidding price must be bigger than current price + step',
          400
        )
      );
    }
  } else {
    return next(new ErrorHandler('This product has been expired', 400));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// Delete Product   =>   /api/v1/admin/product/:id
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  if (req.user.id !== product.user.toString() && req.user.role !== 'admin') {
    return next(
      new ErrorHandler(
        'You are not authorized to make change to this product',
        401
      )
    );
  }

  // Deleting images associated with the product
  for (const element of product.images) {
    const result = await cloudinary.v2.uploader.destroy(element.public_id);
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: 'Product is deleted.',
  });
});

// Create new review   =>   /api/v1/review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get Product Reviews   =>   /api/v1/reviews
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Product Review   =>   /api/v1/reviews
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  console.log(product);

  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.id.toString()
  );

  const numOfReviews = reviews.length;

  const ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});
