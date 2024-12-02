import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import { ErrorHandler } from "../utils/errors.js";
import { verifyItems, verifyPaymentAmounts } from "../utils/checkout.js";
import { reserveStock, returnStock } from "../utils/stock.js";

// Create new order for COD payment  =>  /api/v1/orders/new
export const newOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderItems, shippingInfo, paymentInfo, } = req.body;

  // Check that country is Canada for a COD order
  if (shippingInfo?.country !== "Canada" && shippingInfo?.method === "COD") {
    return next(new ErrorHandler("Cash on delivery is not available for international shipments", 400, { CODWrongCountry: true }));
  }

  // Filter items with a quantity greater than zero
  let filteredOrderItems = orderItems.filter((orderItem) => orderItem.quantity > 0);

  if (!filteredOrderItems.length) {
    return next(new ErrorHandler("Your cart is empty", 400, { cartEmpty: true }));
  }

  let actualItems = [];
  let actualItemsPriceCents = 0;

  // Get actual items
  for (let i = 0; i < filteredOrderItems.length; i++) {
    const actualItem = await Product.findById(filteredOrderItems[i].productId);

    if (!actualItem) {
      continue;
    }

    actualItemsPriceCents += actualItem.priceCents * orderItems[i].quantity;

    actualItems.push(actualItem);
  }

  // Verify items
  const itemError = await verifyItems(filteredOrderItems, actualItems);

  if (itemError) {
    return next(itemError);
  }

  // Verify payment amounts
  const paymentError = await verifyPaymentAmounts(shippingInfo, paymentInfo, actualItemsPriceCents);

  if (paymentError) {
    return next(paymentError);
  }

  // Reserve items
  const reserveError = await reserveStock(filteredOrderItems, actualItems);

  if (reserveError) {
    return next(reserveError);
  }

  // Create order
  try {
    const order = await Order.create({
      orderItems: filteredOrderItems,
      shippingInfo,
      paymentInfo: { method: "COD", status: "Not Paid", amounts: paymentInfo?.amounts },
      user: req.user._id,
    });

    res.status(201).json({
      order,
    });
  } catch (error) {
    returnStock(filteredOrderItems);

    return next(new ErrorHandler(error.message, 500, { backendError: true }, error.name));
  }
});

// Get current user orders  =>  /api/v1/me/orders
export const myOrders = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate } = req?.query;

  const orders = await Order.find({ user: req?.user?._id, createdAt: { $gte: startDate, $lte: endDate } });

  res.status(200).json({
    orders,
  });
});

// Get order details  =>  /api/v1/orders/:id
export const getOrderDetails = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params?.id).populate(
    "user",
    "name email"
  );

  if (!order || (req.user.role !== "admin" && order.user?.id !== req.user?.id)) {
    return next(new ErrorHandler("No order found with this ID", 404));
  }

  res.status(200).json({
    order,
  });
});

// Get orders - ADMIN  =>  /api/v1/admin/orders
export const allOrders = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const orders = await Order.find({ createdAt: { $gte: startDate, $lte: endDate } });

  res.status(200).json({
    orders,
  });
});

// Update Order - ADMIN  =>  /api/v1/admin/orders/:id
export const updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("No Order found with this ID", 404));
  }

  if (order?.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have already delivered this order", 400));
  }

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save();

  res.status(200).json({
    success: true,
  });
});

// Delete order - ADMIN  =>  /api/v1/admin/orders/:id
export const deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("No Order found with this ID", 404));
  }

  if (order?.orderStatus !== "Processing") {
    return next(new ErrorHandler("You cannot delete this order", 400));
  }

  await order.deleteOne();

  // Return reserved items to stock
  await returnStock(order.orderItems);

  res.status(200).json({
    success: true,
  });
});

function getDatesBetween(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    const formattedDate = currentDate.toISOString().split("T")[0];
    dates.push(formattedDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

// Get Sales Data - ADMIN  =>  /api/v1/admin/get_sales
export const getSales = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate, tzString } = req.query;

  const salesData = await Order.aggregate([
    {
      // Stage 1: Filter documents
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      // Stage 2: Group documents by date and calculate total sales and number of orders
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: `${tzString}` } },
        },
        totalSales: { $sum: "$paymentInfo.amounts.totalAmountCents" },
        numOrders: { $sum: 1 }
      },
    },
  ]);

  // Create a Map to store total sales and number of orders by date
  const salesMap = new Map();
  let totalSales = 0;
  let totalNumOrders = 0;

  salesData.forEach((entry) => {
    const date = entry?._id.date;
    const sales = entry?.totalSales;
    const numOrders = entry?.numOrders;

    salesMap.set(date, { sales, numOrders });

    totalSales += sales;
    totalNumOrders += numOrders;
  });

  // Generate an array of dates between start & end Date
  const datesBetween = getDatesBetween(startDate, endDate);

  // Create final sales data array with 0 for dates without sales
  const finalSalesData = datesBetween.map((date) => ({
    date,
    sales: (salesMap.get(date) || { sales: 0 }).sales,
    numOrders: (salesMap.get(date) || { numOrders: 0 }).numOrders,
  }));

  res.status(200).json({
    totalSales,
    totalNumOrders,
    sales: finalSalesData,
  });
});