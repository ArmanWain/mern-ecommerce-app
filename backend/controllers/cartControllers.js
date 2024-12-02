import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import Product from "../models/product.js";
import { getDeliveryOptions } from "../utils/deliveryOptions.js";
import { ErrorHandler } from "../utils/errors.js";
import { verifyItems } from "../utils/checkout.js";

// Get checkout details  =>  /api/v1/cart/checkout_details
export const getCheckoutDetails = (req, res, next) => {
  const shippingInfo = req?.body?.shippingInfo;
  const cartItems = req?.body?.cartItems;

  const deliveryOptions = getDeliveryOptions(cartItems, shippingInfo);
  const percentTax = 13;

  res.status(200).json({
    deliveryOptions,
    percentTax
  });
};

// Can add to cart  =>  /api/v1/cart/:id
export const canAddToCart = catchAsyncErrors(async (req, res, next) => {
  const id = req?.params?.id;
  const quantity = req?.body?.quantity;
  const cartQuantity = req?.body?.cartQuantity;

  const product = await Product.findById(id);

  if (!product) {
    return next(new ErrorHandler("This item no longer exists", 404));
  }

  if (product.stock < quantity + cartQuantity) {
    return next(new ErrorHandler("There is not enough inventory in stock to add this item to your cart", 400));
  }

  res.status(200).json({
    success: true
  });
});

// Verify cart  =>  /api/v1/cart/verify
export const verifyCart = catchAsyncErrors(async (req, res, next) => {
  const orderItems = req?.body;

  // Filter items with a quantity greater than zero
  const filteredOrderItems = orderItems.filter((orderItem) => orderItem.quantity > 0);

  if (!filteredOrderItems.length) {
    return res.status(200).json({
      success: true
    });
  }

  let actualItems = [];

  // Get actual items
  for (let i = 0; i < filteredOrderItems.length; i++) {
    const actualItem = await Product.findById(filteredOrderItems[i].productId);

    if (!actualItem) {
      continue;
    }

    actualItems.push(actualItem);
  }

  // Verify items
  const itemError = await verifyItems(filteredOrderItems, actualItems);

  if (itemError) {
    return next(itemError);
  }

  res.status(200).json({
    success: true
  });
});

// Can proceed with checkout  =>  /api/v1/cart/can_proceed
export const canProceedWithCheckout = catchAsyncErrors(async (req, res, next) => {
  const orderItems = req?.body;

  // Filter items with a quantity greater than zero
  const filteredOrderItems = orderItems.filter((orderItem) => orderItem.quantity > 0);

  if (!filteredOrderItems.length) {
    return next(new ErrorHandler("Your cart is empty", 400, { cartEmpty: true }));
  }

  let actualItems = [];

  // Get actual items
  for (let i = 0; i < filteredOrderItems.length; i++) {
    const actualItem = await Product.findById(filteredOrderItems[i].productId);

    if (!actualItem) {
      continue;
    }

    actualItems.push(actualItem);
  }

  // Verify items
  const itemError = await verifyItems(filteredOrderItems, actualItems);

  if (itemError) {
    return next(itemError);
  }

  res.status(200).json({
    success: true
  });
});