const Category = require("../models/category");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");

// Create new category   =>   /api/v1/admin/category/new
exports.newCategory = catchAsyncErrors(async (req, res, next) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    return res.status(400).json(error);
  }
});

// Get all categories   =>   /api/v1/categories
exports.getCategories = catchAsyncErrors(async (req, res, next) => {
  try {
    const resPerPage = 1000;
    const categoriesCount = await Category.countDocuments();

    const apiFeatures = new APIFeatures(Category.find(), req.query)
      .search()
      .filter();

    let categories = await apiFeatures.query;
    let filteredCategoriesCount = categories.length;

    apiFeatures.pagination(resPerPage);
    categories = await apiFeatures.query;

    res.status(200).json({
      success: true,
      categoriesCount,
      resPerPage,
      filteredCategoriesCount,
      categories,
    });
  } catch (error) {
    return res.status(400).json(error);
  }
});

// Get all Categories (Admin)  =>   /api/v1/admin/categories
exports.getAdminCategories = catchAsyncErrors(async (req, res, next) => {
  try {
    const categories = await Category.find();

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    return res.status(400).json(error);
  }
});

// Get single category details   =>   /api/v1/category/:id
exports.getSingleCategory = catchAsyncErrors(async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ErrorHandler("Category not found", 404));
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    return res.status(400).json(error);
  }
});

// Update Category   =>   /api/v1/admin/category/:id
exports.updateCategory = catchAsyncErrors(async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ErrorHandler("Category not found", 404));
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    return res.status(400).json(error);
  }
});

// Delete Categories   =>   /api/v1/admin/category/:id
exports.deleteCategory = catchAsyncErrors(async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ErrorHandler("Category not found", 404));
    }

    await category.remove();

    res.status(200).json({
      success: true,
      message: "Category is deleted.",
    });
  } catch (error) {
    return res.status(400).json(error);
  }
});
