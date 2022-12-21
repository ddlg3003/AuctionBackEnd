const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter product name"],
    trim: true,
    maxLength: [100, "Product name cannot exceed 100 characters"],
  },
  minPrice: {
    type: Number,
    required: [true, "Please enter product min price"],
    maxLength: [5, "Product name cannot exceed 5 characters"],
    default: 0,
  },
  step: {
    type: Number,
    required: [true, "Please enter product step"],
    maxLength: [5, "Product name cannot exceed 5 characters"],
    default: 0,
  },
  currentPrice: {
    type: Number,
    // required: [true, "Please enter product price"],
    maxLength: [5, "Product name cannot exceed 5 characters"],
    default: 0,
  },
  shortDescription: {
    type: String,
    required: [true, "Please enter product short description"],
  },
  description: {
    type: String,
    required: [true, "Please enter product description"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  mainImage: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  subImage1: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  subImage2: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  subImage3: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
    required: true,
  },
  seller: {
    type: String,
    // required: [true, "Please enter product seller"],
  },
  // stock: {
  //   type: Number,
  //   required: [true, "Please enter product stock"],
  //   maxLength: [5, "Product name cannot exceed 5 characters"],
  //   default: 0,
  // },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  priceHolder: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
    required: [true, "Please enter product end time"],
  },
  auctionLogs: [
    {
      auctionAt: {
        type: Date,
        default: Date.now,
      },
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      bidPrice: {
        type: Number,
        required: true,
      }
    }
  ]
});

module.exports = mongoose.model("Product", productSchema);
