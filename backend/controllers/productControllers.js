import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import { productFilters } from "../utils/filters.js";
import { ErrorHandler } from "../utils/errors.js";
import { delete_file, upload_file } from "../utils/cloudinary.js";

// Get products   =>  /api/v1/products
export const getProducts = catchAsyncErrors(async (req, res, next) => {
  // Generate the query
  const query = productFilters(req.query);

  // Execute the query
  let products = await query;
  const filteredProductsCount = products.length;

  // Get the results for the current page
  const resPerPage = 4;
  const currentPage = Number(req.query.page) || 1;

  products = products.slice((currentPage - 1) * resPerPage, currentPage * resPerPage);

  res.status(200).json({
    resPerPage,
    filteredProductsCount,
    products,
  });
});

// Create new product - ADMIN  =>  /api/v1/admin/products
export const newProduct = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user._id;

  const product = await Product.create(req.body);

  res.status(201).json({
    product,
  });
});

// Get single product details   =>  /api/v1/products/:id
export const getProductDetails = catchAsyncErrors(async (req, res, next) => {
  let product;

  product = await Product.findById(req?.params?.id).populate(
    "reviews.user"
  );

  if (!product) {
    return next(new ErrorHandler(
      "This item does not exist",
      404,
      {
        productNotFound: {
          status: true,
        }
      }
    ));
  }

  res.status(200).json({
    product,
  });
});

// Get single product stock  =>  /api/v1/products/stock/:id
export const getProductStock = catchAsyncErrors(async (req, res, next) => {
  const productId = req?.params?.id;

  const product = await Product.findById(productId);

  if (!product) {
    const productNotFound = {
      status: true,
      productId
    }

    return next(new ErrorHandler("This item no longer exists", 404, { productNotFound }));
  }

  const stock = product.stock;

  res.status(200).json({
    productId,
    stock
  });
});

// Get products - ADMIN  =>  /api/v1/admin/products
export const getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    products,
  });
});

// Update product details - ADMIN  =>  /api/v1/admin/products/:id
export const updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req?.params?.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  product = await Product.findByIdAndUpdate(req?.params?.id, req.body, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    product,
  });
});

// Upload product images - ADMIN  =>  /api/v1/admin/products/:id/upload_images
export const uploadProductImages = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req?.params?.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const uploader = async (image) => upload_file(image, "mern-ecommerce/products");

  const urls = await Promise.all((req?.body?.newImages).map(uploader));

  product?.images?.push(...urls);
  await product?.save();

  res.status(200).json({
    product,
  });
});

// Delete product image - ADMIN  =>  /api/v1/admin/products/:id/delete_image
export const deleteProductImage = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req?.params?.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const isDeleted = await delete_file(req.body.imgId);

  if (isDeleted) {
    product.images = product?.images?.filter(
      (img) => img.public_id !== req.body.imgId
    );

    await product.save();
  }

  res.status(200).json({
    product,
  });
});

// Delete product - ADMIN  =>  /api/v1/admin/products/:id
export const deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req?.params?.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // Delete images associated with product
  for (let i = 0; i < product?.images?.length; i++) {
    await delete_file(product?.images[i].public_id);
  }

  await product.deleteOne();

  res.status(200).json({
    message: "Product Deleted",
  });
});

// Create/Update product review   =>  /api/v1/reviews
export const createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const user = req?.user?._id;

  // Check if user has purchased the product
  const hasPurchased = Boolean(await Order.findOne({ user, "orderItems.productId": productId }));

  if (!hasPurchased) {
    return next(new ErrorHandler("You have not purchased this product", 400));
  }

  const review = {
    user,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // Check if user has reviewed the product
  const isReviewed = Boolean(product?.reviews?.find(
    (review) => review.user.toString() === req?.user?._id.toString()
  ));

  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review?.user?.toString() === req?.user?._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

  await product.save();

  res.status(200).json({
    success: true,
  });
});

// Get product reviews   =>  /api/v1/reviews
export const getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id).populate("reviews.user");

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    productId: req.query.id,
    reviews: product.reviews,
  });
});

// Delete product review - ADMIN  =>  /api/v1/admin/reviews
export const deleteReview = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  product.reviews = product?.reviews?.filter(
    (review) => review._id.toString() !== req?.query?.id.toString()
  );

  // Set new number of reviews
  product.numOfReviews = product.reviews.length;

  // Set new average rating
  product.rating =
    product.numOfReviews === 0
      ? 0
      : product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.numOfReviews;

  product = await product.save();

  res.status(200).json({
    success: true,
    product,
  });
});

// Can user review   =>  /api/v1/can_review
export const canUserReview = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id.toString();
  const productId = req.query.productId;

  const order = await Order.findOne({
    user: userId,
    "orderItems.productId": productId,
  });

  // User has not ordered the product
  if (!order) {
    return res.status(200).json({ canReview: false });
  }

  // Check if user has already posted a review
  const product = await Product.findById(productId);
  const hasPostedReview = Boolean(product.reviews.find((review) => review.user.toString() === userId));

  res.status(200).json({
    canReview: true,
    hasPostedReview
  });
});